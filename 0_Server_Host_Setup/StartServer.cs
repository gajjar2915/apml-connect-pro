using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

class StartServer {
    static void Main() {
        string batPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, @"0_Server_Host_Setup\start_server.bat");
        
        // Fallback for direct folder running
        if (!File.Exists(batPath)) {
            batPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "start_server.bat");
        }

        if (!File.Exists(batPath)) {
            MessageBox.Show("Could not find start_server.bat launcher inside 0_Server_Host_Setup directory!", "APML Connect Pro - Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return;
        }

        try {
            ProcessStartInfo psi = new ProcessStartInfo();
            psi.FileName = "cmd.exe";
            psi.Arguments = "/c \"" + batPath + "\"";
            psi.WorkingDirectory = Path.GetDirectoryName(batPath);
            psi.UseShellExecute = true; // Show CMD window so they can see logs and stop it
            
            Process.Start(psi);
        } catch (Exception ex) {
            MessageBox.Show("Failed to launch server: " + ex.Message, "APML Connect Pro - Launch Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }
}
