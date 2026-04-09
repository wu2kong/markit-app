use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::{AppHandle, Manager};
use url::Url;

#[derive(Debug, Serialize, Deserialize)]
pub struct PageMetadata {
    pub title: Option<String>,
    pub description: Option<String>,
    pub favicon_url: Option<String>,
}

#[tauri::command]
pub async fn fetch_metadata(url: String) -> Result<PageMetadata, String> {
    fetch_page_metadata(&url).await
}

pub async fn fetch_page_metadata(url: &str) -> Result<PageMetadata, String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .user_agent("Mozilla/5.0 (compatible; MarkIt/1.0)")
        .redirect(reqwest::redirect::Policy::limited(3))
        .build()
        .map_err(|e| e.to_string())?;

    let parsed_url = Url::parse(url).map_err(|e| format!("Invalid URL: {}", e))?;
    let domain = parsed_url
        .host_str()
        .ok_or_else(|| "Invalid URL: no domain".to_string())?;

    let response = client
        .get(url)
        .send()
        .await
        .map_err(|e| format!("Failed to fetch page: {}", e))?;

    let html = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;

    let title = extract_title(&html);
    let description = extract_description(&html);
    let favicon_url = extract_favicon_url(&html, domain);

    Ok(PageMetadata {
        title,
        description,
        favicon_url,
    })
}

fn extract_title(html: &str) -> Option<String> {
    let document = scraper::Html::parse_document(html);
    let selector = scraper::Selector::parse("title").ok()?;

    document
        .select(&selector)
        .next()
        .map(|el| el.text().collect::<String>())
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
}

fn extract_description(html: &str) -> Option<String> {
    let document = scraper::Html::parse_document(html);

    let og_selector = scraper::Selector::parse("meta[property='og:description']").ok()?;
    let twitter_selector = scraper::Selector::parse("meta[name='twitter:description']").ok()?;
    let meta_selector = scraper::Selector::parse("meta[name='description']").ok()?;

    if let Some(el) = document.select(&og_selector).next() {
        if let Some(content) = el.value().attr("content") {
            return Some(content.trim().to_string());
        }
    }

    if let Some(el) = document.select(&twitter_selector).next() {
        if let Some(content) = el.value().attr("content") {
            return Some(content.trim().to_string());
        }
    }

    if let Some(el) = document.select(&meta_selector).next() {
        if let Some(content) = el.value().attr("content") {
            return Some(content.trim().to_string());
        }
    }

    None
}

fn extract_favicon_url(html: &str, domain: &str) -> Option<String> {
    let document = scraper::Html::parse_document(html);

    let link_rel_icon = scraper::Selector::parse("link[rel='icon']").ok()?;
    let link_rel_shortcut = scraper::Selector::parse("link[rel='shortcut icon']").ok()?;
    let link_rel_apple = scraper::Selector::parse("link[rel='apple-touch-icon']").ok()?;

    let selectors = [link_rel_icon, link_rel_shortcut, link_rel_apple];

    for selector in &selectors {
        if let Some(el) = document.select(selector).next() {
            if let Some(href) = el.value().attr("href") {
                if href.starts_with("http://") || href.starts_with("https://") {
                    return Some(href.to_string());
                } else if href.starts_with("//") {
                    return Some(format!("https:{}", href));
                } else if href.starts_with('/') {
                    return Some(format!("https://{}{}", domain, href));
                } else {
                    return Some(format!("https://{}/{}", domain, href));
                }
            }
        }
    }

    None
}

#[tauri::command]
pub async fn download_favicon(
    app: AppHandle,
    url: String,
    bookmark_url: String,
) -> Result<String, String> {
    download_favicon_internal(&app, &url, &bookmark_url).await
}

pub async fn download_favicon_internal(
    app: &AppHandle,
    favicon_url: &str,
    bookmark_url: &str,
) -> Result<String, String> {
    let favicons_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?
        .join("favicons");

    std::fs::create_dir_all(&favicons_dir)
        .map_err(|e| format!("Failed to create favicons dir: {}", e))?;

    let parsed_bookmark = Url::parse(bookmark_url).map_err(|e| format!("Invalid bookmark URL: {}", e))?;
    let domain = parsed_bookmark
        .host_str()
        .ok_or_else(|| "Invalid bookmark URL: no domain".to_string())?;

    let extension = determine_favicon_extension(favicon_url);
    let filename = format!("{}.{}", domain_to_filename(domain), extension);
    let file_path = favicons_dir.join(&filename);

    if file_path.exists() {
        return Ok(format!("favicons/{}", filename));
    }

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .user_agent("Mozilla/5.0 (compatible; MarkIt/1.0)")
        .redirect(reqwest::redirect::Policy::limited(3))
        .build()
        .map_err(|e| e.to_string())?;

    let response = client
        .get(favicon_url)
        .send()
        .await
        .map_err(|e| format!("Failed to download favicon: {}", e))?;

    let bytes = response
        .bytes()
        .await
        .map_err(|e| format!("Failed to read favicon: {}", e))?;

    std::fs::write(&file_path, bytes)
        .map_err(|e| format!("Failed to save favicon: {}", e))?;

    Ok(format!("favicons/{}", filename))
}

fn determine_favicon_extension(url: &str) -> String {
    let url_lower = url.to_lowercase();
    
    if url_lower.contains(".svg") {
        return "svg".to_string();
    }
    if url_lower.contains(".png") {
        return "png".to_string();
    }
    "ico".to_string()
}

fn domain_to_filename(domain: &str) -> String {
    domain
        .replace("www.", "")
        .replace(':', "_")
        .replace('/', "_")
}

#[allow(dead_code)]
pub fn get_favicon_path(app: &AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_data_dir()
        .map(|p| p.join("favicons"))
        .map_err(|e| format!("Failed to get app data dir: {}", e))
}