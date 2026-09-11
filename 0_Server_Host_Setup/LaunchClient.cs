using System;
using System.IO;
using System.Diagnostics;
using System.Drawing;
using System.Windows.Forms;

public class LaunchClient : Form {
    private TextBox txtIp;
    private Button btnConnect;
    private Label lblTitle;
    private Label lblSubtitle;
    private string rolePath;
    private string roleName;

    public LaunchClient(string role, string name) {
        this.rolePath = role;
        this.roleName = name;
        InitializeComponent();
    }

    private void InitializeComponent() {
        this.Text = "APML Connect Pro - Terminal Setup";
        this.Size = new Size(420, 260);
        this.FormBorderStyle = FormBorderStyle.FixedDialog;
        this.StartPosition = FormStartPosition.CenterScreen;
        this.MaximizeBox = false;
        this.MinimizeBox = false;
        this.BackColor = Color.FromArgb(15, 23, 42); // slate-900

        lblTitle = new Label();
        lblTitle.Text = "✚ APML Connect Pro";
        lblTitle.ForeColor = Color.FromArgb(52, 211, 153); // emerald-400
        lblTitle.Font = new Font("Segoe UI", 16, FontStyle.Bold);
        lblTitle.Location = new Point(20, 20);
        lblTitle.Size = new Size(380, 30);

        lblSubtitle = new Label();
        lblSubtitle.Text = "Enter Central Server Host IP Address to configure this " + roleName + " terminal:";
        lblSubtitle.ForeColor = Color.FromArgb(148, 163, 184); // slate-400
        lblSubtitle.Font = new Font("Segoe UI", 9, FontStyle.Regular);
        lblSubtitle.Location = new Point(20, 60);
        lblSubtitle.Size = new Size(360, 40);

        txtIp = new TextBox();
        txtIp.Font = new Font("Segoe UI", 10, FontStyle.Regular);
        txtIp.Location = new Point(20, 110);
        txtIp.Size = new Size(360, 26);
        txtIp.BackColor = Color.FromArgb(30, 41, 59); // slate-800
        txtIp.ForeColor = Color.White;
        txtIp.BorderStyle = BorderStyle.FixedSingle;
        txtIp.Text = "localhost";

        btnConnect = new Button();
        btnConnect.Text = "Connect & Launch ➔";
        btnConnect.BackColor = Color.FromArgb(16, 185, 129); // emerald-600
        btnConnect.ForeColor = Color.White;
        btnConnect.Font = new Font("Segoe UI", 10, FontStyle.Bold);
        btnConnect.FlatStyle = FlatStyle.Flat;
        btnConnect.FlatAppearance.BorderSize = 0;
        btnConnect.Location = new Point(20, 160);
        btnConnect.Size = new Size(360, 38);
        btnConnect.Cursor = Cursors.Hand;
        btnConnect.Click += new System.EventHandler(BtnConnect_Click);

        this.Controls.Add(lblTitle);
        this.Controls.Add(lblSubtitle);
        this.Controls.Add(txtIp);
        this.Controls.Add(btnConnect);
    }

    private void BtnConnect_Click(object sender, EventArgs e) {
        string ip = txtIp.Text.Trim();
        if (string.IsNullOrEmpty(ip)) {
            MessageBox.Show("Please enter a valid IP address or 'localhost'.", "Input Error", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            return;
        }

        try {
            string configFile = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "server_config.txt");
            File.WriteAllText(configFile, ip);
            
            int port = 3001;
            if (rolePath == "doctor") port = 3002;
            else if (rolePath == "pharmacy") port = 3003;

            string url = "http://" + ip + ":" + port + "/dashboard/" + rolePath;
            Process.Start(url);
            this.Close();
        } catch (Exception ex) {
            MessageBox.Show("Error saving configuration: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }

    [STAThread]
    public static void Main(string[] args) {
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);

        // Deduce role from the compiled executable name
        string exePath = Process.GetCurrentProcess().MainModule.FileName;
        string exeName = Path.GetFileName(exePath).ToLower();
        string role = "reception";
        string name = "Receptionist";
        
        if (exeName.Contains("doctor")) {
            role = "doctor";
            name = "Doctor Cabinet";
        } else if (exeName.Contains("pharmacy")) {
            role = "pharmacy";
            name = "Pharmacy Counter";
        }

        string configFile = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "server_config.txt");
        if (File.Exists(configFile)) {
            string ip = File.ReadAllText(configFile).Trim();
            if (!string.IsNullOrEmpty(ip)) {
                try {
                    int port = 3001;
                    if (role == "doctor") port = 3002;
                    else if (role == "pharmacy") port = 3003;

                    string url = "http://" + ip + ":" + port + "/dashboard/" + role;
                    Process.Start(url);
                    return;
                } catch {
                    // Fallback to UI if launch fails
                }
            }
        }

        Application.Run(new LaunchClient(role, name));
    }
}
