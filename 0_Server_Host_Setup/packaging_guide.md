# Hospital Distribution & Packaging Guide

This guide describes how to bundle the APML Connect Pro system into a self-contained, distributable installer (similar to a PC game installer) that a client can extract or run to deploy the central server and client terminals automatically.

---

## Method 1: Self-Extracting Archive (7-Zip SFX)
This is the simplest way to create a single `.exe` file that extracts the deployment folders and automatically runs the launcher.

### Steps to Compile:
1. Select the following folders in your file explorer:
   - `0_Server_Host_Setup/`
   - `1_Receptionist_Setup/`
   - `2_Doctor_Setup/`
   - `3_Pharmacy_Setup/`
2. Right-click and choose **7-Zip ➔ Add to archive...**
3. Configure the Archive options:
   - **Archive format**: `7z`
   - **Compression level**: `Ultra`
   - Check **Create SFX archive** (this turns the output into an `.exe` installer).
4. Go to the **Advanced** tab or use a custom SFX configuration file (e.g. `config.txt` containing the launch directives below):

```txt
;!@Install@!UTF-8!
Title="APML Connect Pro Installer"
BeginPrompt="Do you want to install APML Connect Pro Clinic Ecosystem on this computer?"
RunProgram="0_Server_Host_Setup\start_server.bat"
;!@InstallEnd@!
```
5. Click **OK** to generate the `APML_Connect_Pro_Setup.exe` installer.

---

## Method 2: Professional Wizard Installer (Inno Setup)
Inno Setup is a free tool to build professional Windows installers with step-by-step installation wizards, license agreements, and desktop icon creations.

### Inno Setup Script (`installer_script.iss`):
1. Install [Inno Setup](https://jrsoftware.org/isinfo.php).
2. Create a script file named `installer.iss` in the project root:

```iss
[Setup]
AppName=APML Connect Pro
AppVersion=1.0
DefaultDirName={pf}\APML Connect Pro
DefaultGroupName=APML Connect Pro
OutputDir=.
OutputBaseFilename=APML_Connect_Pro_Wizard_Setup
Compression=lzma
SolidCompression=yes
SetupIconFile=0_Server_Host_Setup\frontend\public\favicon.ico

[Files]
Source: "0_Server_Host_Setup\*"; DestDir: "{app}\0_Server_Host_Setup"; Flags: recursesubdirs createallsubdirs
Source: "1_Receptionist_Setup\*"; DestDir: "{app}\1_Receptionist_Setup"; Flags: recursesubdirs createallsubdirs
Source: "2_Doctor_Setup\*"; DestDir: "{app}\2_Doctor_Setup"; Flags: recursesubdirs createallsubdirs
Source: "3_Pharmacy_Setup\*"; DestDir: "{app}\3_Pharmacy_Setup"; Flags: recursesubdirs createallsubdirs

[Icons]
Name: "{group}\Start Server Host"; Filename: "{app}\0_Server_Host_Setup\start_server.bat"; IconFilename: "{app}\0_Server_Host_Setup\frontend\public\favicon.ico"
Name: "{commondesktop}\APML Server Console"; Filename: "{app}\0_Server_Host_Setup\start_server.bat"
Name: "{commondesktop}\Reception Desk Launcher"; Filename: "{app}\1_Receptionist_Setup\launch_pc_reception.bat"
Name: "{commondesktop}\Doctor Workspace Launcher"; Filename: "{app}\2_Doctor_Setup\launch_pc_doctor.bat"
Name: "{commondesktop}\Pharmacy Desk Launcher"; Filename: "{app}\3_Pharmacy_Setup\launch_pc_pharmacy.bat"

[Run]
Filename: "{app}\0_Server_Host_Setup\start_server.bat"; Description: "Launch Central Server Host Now"; Flags: postinstall nowait
```
3. Compile the script using Inno Setup Compiler to generate `APML_Connect_Pro_Wizard_Setup.exe`.

---

## Method 3: Offline Deployment Configuration (Crucial for Local Wi-Fi)
Hospital environments often lack high-speed internet connections during site setups. To make the installer fully **self-contained** and offline-ready:

### 1. Pre-Cache Docker Images (Run on your development machine)
Before packaging, download and export the required container images as `.tar` files:

```powershell
# Pull images
docker pull postgres:15-alpine
docker pull redis:7-alpine

# Export images to tar files
docker save -o postgres_15.tar postgres:15-alpine
docker save -o redis_7.tar redis:7-alpine
```

### 2. Include tar files in the setup folder
Place `postgres_15.tar` and `redis_7.tar` inside `0_Server_Host_Setup/`.

### 3. Update the Server Startup Script
Add commands to automatically import these images locally if they aren't loaded yet. Add this block to the top of `0_Server_Host_Setup/start_server.bat` right before running `docker-compose up`:

```batch
:: Import Docker images offline if needed
echo Loading offline database images...
docker image inspect postgres:15-alpine >nul 2>&1
if %errorlevel% neq 0 (
    docker load -i "%~dp0postgres_15.tar"
)
docker image inspect redis:7-alpine >nul 2>&1
if %errorlevel% neq 0 (
    docker load -i "%~dp0redis_7.tar"
)
```

By adding these pre-cached images, the installer will run Docker containers on any new host computer with **zero internet requirements**.
