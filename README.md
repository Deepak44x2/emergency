🚨 SOS Emergency Button

The SOS Emergency Button is a safety app that allows users to instantly notify their close contacts in case of an emergency. With just one click, it sends an SMS containing the user’s current location to predefined emergency contacts.

✨ Features

🆘 One-click SOS – Instantly trigger an emergency alert.

📍 Location Sharing – Sends your live location (latitude, longitude, and Google Maps link).

📲 SMS Notifications – Sends alerts via Twilio SMS API.

🔐 User Authentication – Powered by Supabase for secure login/signup.

⚡ Fast & Reliable – Built with React for a smooth user experience.

🛠️ Tech Stack

Frontend: React.js

Backend/Database: Supabase

Messaging Service: Twilio (SMS API)

Hosting/Deployment: (Add your choice, e.g., Netlify, Vercel, or Render)

## 🚀 Getting Started

1. **Clone the repository**  
   ```bash
   git clone https://github.com/<your-username>/sos-emergency-button.git
   cd sos-emergency-button


2. Install Dependencies
   ```bash
     npm install
   
3. Set Up Environment Variables
    ```
    Create a .env file in the root directory and add your credentials:
       
    REACT_APP_SUPABASE_URL=your_supabase_url
    REACT_APP_SUPABASE_ANON_KEY=your_supabase_key
    REACT_APP_TWILIO_ACCOUNT_SID=your_twilio_sid
    REACT_APP_TWILIO_AUTH_TOKEN=your_twilio_auth_token
    REACT_APP_TWILIO_PHONE_NUMBER=your_twilio_phone_number


5. Run the App
   ```bash
   npm start



The app will be live at http://localhost:3000
.



Add screenshots/gifs here to showcase UI.

📖 How It Works

User logs in using Supabase Auth.

On clicking the SOS Button, the app fetches the user’s current location.

The location and alert message are sent via Twilio SMS to registered emergency contacts.

The contact receives an SMS like:

🚨 SOS Alert! [User's Name] needs help. 
Location: https://maps.google.com/?q=latitude,longitude

🔮 Future Enhancements

Add push notifications.

Allow multiple emergency contacts.

Offline mode (send alert once network is back).

Integration with WhatsApp (via Twilio).

🤝 Contributing

Contributions are welcome! Please fork the repo and create a pull request.
