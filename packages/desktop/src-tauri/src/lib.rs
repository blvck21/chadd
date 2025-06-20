use tauri::{Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, CustomMenuItem, SystemTrayMenuItem, AppHandle, Window};
use serde::{Deserialize, Serialize};
use std::env;
use std::path::PathBuf;
use std::fs::File;
use std::io::Write;
use futures_util::StreamExt;

// Load environment variables from .env files
fn load_env_vars() {
    // Try to load from .env.local first (highest priority)
    if let Err(_) = dotenv::from_filename(".env.local") {
        // Fallback to .env
        let _ = dotenv::dotenv();
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct GitHubAsset {
    name: String,
    browser_download_url: String,
    size: u64,
}

#[derive(Debug, Serialize, Deserialize)]
struct GitHubRelease {
    tag_name: String,
    name: String,
    body: String,
    html_url: String,
    published_at: String,
    prerelease: bool,
    draft: bool,
    assets: Vec<GitHubAsset>,
}

#[derive(Debug, Serialize, Deserialize)]
struct UpdateInfo {
    available: bool,
    current_version: String,
    latest_version: String,
    download_url: Option<String>,
    release_notes: Option<String>,
    error: Option<String>,
    asset_size: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct DownloadProgress {
    downloaded: u64,
    total: u64,
    percentage: f64,
    status: String,
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn check_for_updates(app_handle: AppHandle) -> Result<UpdateInfo, String> {
    // Load environment variables from .env files
    load_env_vars();
    
    let current_version = app_handle.package_info().version.to_string();
    
    // GitHub repository - replace YOUR_GITHUB_USERNAME with your actual username!
    let repo_url = "https://api.github.com/repos/blvck21/chadd/releases/latest";
    
    println!("Checking for updates at: {}", repo_url);
    
    match fetch_latest_release(repo_url).await {
        Ok(release) => {
            let latest_version = release.tag_name.trim_start_matches('v');
            let is_newer = compare_versions(&current_version, latest_version);
            
            println!("Version comparison: current='{}', latest='{}', is_newer={}", 
                     current_version, latest_version, is_newer);
            
            // Find the Windows installer asset
            let download_url = find_windows_installer(&release.assets);
            let asset_size = download_url.as_ref()
                .and_then(|url| release.assets.iter().find(|a| a.browser_download_url == *url))
                .map(|asset| asset.size);
            
            Ok(UpdateInfo {
                available: is_newer,
                current_version,
                latest_version: latest_version.to_string(),
                download_url,
                release_notes: Some(release.body),
                error: None,
                asset_size,
            })
        }
        Err(e) => {
            Ok(UpdateInfo {
                available: false,
                current_version,
                latest_version: "Unknown".to_string(),
                download_url: None,
                release_notes: None,
                error: Some(format!("Failed to check for updates: {}", e)),
                asset_size: None,
            })
        }
    }
}

async fn fetch_latest_release(url: &str) -> Result<GitHubRelease, Box<dyn std::error::Error>> {
    let client = reqwest::Client::new();
    
    let mut request = client
        .get(url)
        .header("User-Agent", "CHADD-Updater")
        .header("Accept", "application/vnd.github.v3+json");
    
    // Try to get GitHub token from environment variables
    // Priority: GITHUB_TOKEN > GITHUB_ACCESS_TOKEN
    let token_used = if let Ok(token) = env::var("GITHUB_TOKEN") {
        println!("Using GITHUB_TOKEN for authentication");
        request = request.header("Authorization", format!("Bearer {}", token));
        true
    } else if let Ok(token) = env::var("GITHUB_ACCESS_TOKEN") {
        println!("Using GITHUB_ACCESS_TOKEN for authentication");
        request = request.header("Authorization", format!("Bearer {}", token));
        true
    } else {
        println!("No GitHub token found - trying public access");
        false
    };
    
    let response = request.send().await?;
    
    if response.status().is_success() {
        let release: GitHubRelease = response.json().await?;
        println!("Successfully fetched release: {} ({})", release.name, release.tag_name);
        Ok(release)
    } else {
        let status = response.status();
        let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        
        if status == 404 && !token_used {
            Err("Repository not found or releases are private. This is normal if you haven't created any releases yet, or if releases are private and no token is configured.".into())
        } else if status == 404 {
            Err("Repository not found or no releases available. Check repository URL and ensure releases exist.".into())
        } else if status == 401 || status == 403 {
            Err("Authentication failed. Check your GitHub token permissions for private repositories.".into())
        } else {
            Err(format!("HTTP error {}: {}", status, error_text).into())
        }
    }
}

fn find_windows_installer(assets: &[GitHubAsset]) -> Option<String> {
    // Look for Windows installer files
    for asset in assets {
        let name_lower = asset.name.to_lowercase();
        if name_lower.ends_with(".exe") && (name_lower.contains("setup") || name_lower.contains("installer") || name_lower.contains("x64")) {
            return Some(asset.browser_download_url.clone());
        }
    }
    None
}

fn compare_versions(current: &str, latest: &str) -> bool {
    // Simple version comparison - you might want to use a proper semver crate
    let current_parts: Vec<u32> = current.split('.').filter_map(|s| s.parse().ok()).collect();
    let latest_parts: Vec<u32> = latest.split('.').filter_map(|s| s.parse().ok()).collect();
    
    for i in 0..std::cmp::max(current_parts.len(), latest_parts.len()) {
        let current_part = current_parts.get(i).unwrap_or(&0);
        let latest_part = latest_parts.get(i).unwrap_or(&0);
        
        if latest_part > current_part {
            return true;
        } else if latest_part < current_part {
            return false;
        }
    }
    
    false
}

#[tauri::command]
async fn download_and_install_update(window: Window, download_url: String) -> Result<String, String> {
    println!("Starting download from: {}", download_url);
    
    // Create temp directory for download
    let temp_dir = std::env::temp_dir();
    let filename = download_url.split('/').last().unwrap_or("update.exe");
    let file_path = temp_dir.join(filename);
    
    println!("Downloading to: {:?}", file_path);
    
    // Download with progress
    match download_file_with_progress(&window, &download_url, &file_path).await {
        Ok(_) => {
            println!("Download completed, starting installation...");
            
            // Emit progress update
            let _ = window.emit("download-progress", DownloadProgress {
                downloaded: 0,
                total: 0,
                percentage: 100.0,
                status: "Installing...".to_string(),
            });
            
            // Start the installer
            match std::process::Command::new(&file_path)
                .arg("/SILENT")  // Try silent install first
                .spawn()
            {
                Ok(_) => {
                    println!("Installer started, will exit application");
                    
                    // Give installer a moment to start
                    tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
                    
                    // Exit the application so installer can complete
                    std::process::exit(0);
                }
                Err(e) => {
                    // If silent install fails, try normal install
                    println!("Silent install failed, trying normal install: {}", e);
                    match std::process::Command::new(&file_path).spawn() {
                        Ok(_) => {
                            println!("Normal installer started, will exit application");
                            tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
                            std::process::exit(0);
                        }
                        Err(e) => {
                            return Err(format!("Failed to start installer: {}", e));
                        }
                    }
                }
            }
        }
        Err(e) => {
            return Err(format!("Download failed: {}", e));
        }
    }
}

async fn download_file_with_progress(window: &Window, url: &str, path: &PathBuf) -> Result<(), String> {
    let client = reqwest::Client::new();
    
    let mut request = client.get(url);
    
    // Add GitHub token if available
    if let Ok(token) = env::var("GITHUB_TOKEN") {
        request = request.header("Authorization", format!("Bearer {}", token));
    } else if let Ok(token) = env::var("GITHUB_ACCESS_TOKEN") {
        request = request.header("Authorization", format!("Bearer {}", token));
    }
    
    let response = request.send().await.map_err(|e| e.to_string())?;
    let total_size = response.content_length().unwrap_or(0);
    
    let mut file = File::create(path).map_err(|e| e.to_string())?;
    let mut downloaded = 0u64;
    let mut stream = response.bytes_stream();
    
    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| e.to_string())?;
        file.write_all(&chunk).map_err(|e| e.to_string())?;
        downloaded += chunk.len() as u64;
        
        let percentage = if total_size > 0 {
            (downloaded as f64 / total_size as f64) * 100.0
        } else {
            0.0
        };
        
        // Emit progress update
        let _ = window.emit("download-progress", DownloadProgress {
            downloaded,
            total: total_size,
            percentage,
            status: "Downloading...".to_string(),
        });
        
        // Throttle progress updates
        if downloaded % (1024 * 1024) == 0 || downloaded == total_size {
            tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;
        }
    }
    
    Ok(())
}

#[tauri::command]
async fn check_for_updates_silent(app_handle: AppHandle) -> Result<UpdateInfo, String> {
    // Load environment variables from .env files
    load_env_vars();
    
    let current_version = app_handle.package_info().version.to_string();
    
    // GitHub repository - replace YOUR_GITHUB_USERNAME with your actual username!
    let repo_url = "https://api.github.com/repos/blvck21/chadd/releases/latest";
    
    println!("Silent update check at: {}", repo_url);
    
    match fetch_latest_release(repo_url).await {
        Ok(release) => {
            let latest_version = release.tag_name.trim_start_matches('v');
            let is_newer = compare_versions(&current_version, latest_version);
            
            if is_newer {
                println!("Update available: current='{}', latest='{}'", current_version, latest_version);
            } else {
                println!("App is up to date: v{}", current_version);
            }
            
            // Find the Windows installer asset
            let download_url = find_windows_installer(&release.assets);
            let asset_size = download_url.as_ref()
                .and_then(|url| release.assets.iter().find(|a| a.browser_download_url == *url))
                .map(|asset| asset.size);
            
            Ok(UpdateInfo {
                available: is_newer,
                current_version,
                latest_version: latest_version.to_string(),
                download_url,
                release_notes: Some(release.body),
                error: None,
                asset_size,
            })
        }
        Err(e) => {
            println!("Silent update check failed: {}", e);
            Ok(UpdateInfo {
                available: false,
                current_version,
                latest_version: "Unknown".to_string(),
                download_url: None,
                release_notes: None,
                error: Some(format!("Failed to check for updates: {}", e)),
                asset_size: None,
            })
        }
    }
}

#[tauri::command]
fn get_app_version(app_handle: AppHandle) -> String {
    app_handle.package_info().version.to_string()
}

fn create_system_tray() -> SystemTray {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let show = CustomMenuItem::new("show".to_string(), "Show");
    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    SystemTray::new().with_menu(tray_menu)
}

fn handle_system_tray_event(app: &AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::LeftClick {
            position: _,
            size: _,
            ..
        } => {
            let window = app.get_window("main").unwrap();
            window.show().unwrap();
            window.set_focus().unwrap();
        }
        SystemTrayEvent::MenuItemClick { id, .. } => {
            match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                "show" => {
                    let window = app.get_window("main").unwrap();
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
                _ => {}
            }
        }
        _ => {}
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .system_tray(create_system_tray())
        .on_system_tray_event(handle_system_tray_event)
        .setup(|_app| {
            // Setup complete
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, check_for_updates, check_for_updates_silent, get_app_version, download_and_install_update])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
