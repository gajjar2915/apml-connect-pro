# Central Server Host Setup Guide (Clinic Host)

This computer acts as the central host server for the hospital. It runs the PostgreSQL database, backend APIs, and frontend web server.

---

## 1. Quick Setup (Under 5 Minutes)

1. Connect this computer to the clinic's local Wi-Fi router.
2. Ensure **Docker Desktop** is installed and running.
3. Double-click the file `start_server.bat` in this folder.
4. The terminal will start the databases and servers, and print the Host IP address (e.g. `192.168.1.5`).
5. **Note down this IP address.** You will need it to link all other laptops, computers, and mobile devices.
6. Keep this terminal window open during operational hours. Closing it stops the system.

---

## 2. Windows Firewall Port Exception (Crucial)

To allow other computers and mobile devices to connect to this server over the local Wi-Fi:
1. Search for **Windows Defender Firewall with Advanced Security** in the Start Menu and open it.
2. Click **Inbound Rules** in the left panel.
3. Click **New Rule...** in the right panel.
4. Select **Port** and click Next.
5. Select **TCP**, select **Specific local ports**, enter `3001, 3002, 3003, 5005`, and click Next.
6. Select **Allow the connection** and click Next.
7. Keep Domain, Private, and Public checked and click Next.
8. Name it `APML Connect Pro Server` and click Finish.
