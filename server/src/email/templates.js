export const otpEmailTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - ReadCycle</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 32px; text-align: center; color: white; }
        .logo { font-size: 32px; font-weight: 700; margin-bottom: 8px; }
        .tagline { font-size: 14px; opacity: 0.9; font-weight: 400; }
        .content { padding: 40px 32px; }
        .greeting { color: #1e293b; font-size: 24px; font-weight: 600; margin-bottom: 16px; }
        .message { color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 32px; }
        .otp-container { text-align: center; margin: 40px 0; }
        .otp-code { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 32px; font-weight: 700; letter-spacing: 8px; padding: 20px 40px; border-radius: 12px; display: inline-block; box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3); }
        .warning { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin: 24px 0; }
        .warning-text { color: #92400e; font-size: 14px; line-height: 1.5; }
        .expiry { text-align: center; color: #64748b; font-size: 14px; margin-top: 24px; }
        .footer { background: #f1f5f9; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0; }
        .copyright { color: #64748b; font-size: 12px; }
        .help-text { color: #64748b; font-size: 14px; margin-top: 16px; line-height: 1.5; }
        @media (max-width: 640px) {
            .container { margin: 20px; border-radius: 12px; }
            .header, .content { padding: 24px 20px; }
            .otp-code { font-size: 24px; letter-spacing: 6px; padding: 16px 24px; }
            .greeting { font-size: 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">📚 ReadCycle</div>
            <div class="tagline">Empowering readers, one connection at a time</div>
        </div>
        
        <div class="content">
            <h1 class="greeting">Hello {{name}}! 👋</h1>
            <p class="message">
                Welcome to ReadCycle! To complete your registration and start exploring books, please use the verification code below:
            </p>
            
            <div class="otp-container">
                <div class="otp-code">{{otp}}</div>
            </div>
            
            <div class="warning">
                <p class="warning-text">
                    <strong>⚠️ Important:</strong> This code is valid for <strong>5 minutes</strong> only. 
                    Do not share this code with anyone for security reasons.
                </p>
            </div>
            
            <p class="expiry">
                Code expires in: <strong5 minutes</strong>
            </p>
            
            <p class="help-text">
                If you didn't request this verification, please ignore this email or contact our support team immediately.
            </p>
        </div>
        
        <div class="footer">
            <p class="copyright">
                © {{year}} ReadCycle. All rights reserved.<br>
                Building a community of readers worldwide.
            </p>
        </div>
    </div>
</body>
</html>
`;

export const forgotPasswordTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - ReadCycle</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 32px; text-align: center; color: white; }
        .logo { font-size: 32px; font-weight: 700; margin-bottom: 8px; }
        .tagline { font-size: 14px; opacity: 0.9; font-weight: 400; }
        .content { padding: 40px 32px; }
        .greeting { color: #1e293b; font-size: 24px; font-weight: 600; margin-bottom: 16px; }
        .message { color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 32px; }
        .button-container { text-align: center; margin: 40px 0; }
        .reset-button { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 8px 20px rgba(245, 87, 108, 0.3); transition: transform 0.2s, box-shadow 0.2s; }
        .reset-button:hover { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(245, 87, 108, 0.4); }
        .warning { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin: 24px 0; }
        .warning-text { color: #92400e; font-size: 14px; line-height: 1.5; }
        .expiry { text-align: center; color: #64748b; font-size: 14px; margin-top: 24px; }
        .footer { background: #f1f5f9; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0; }
        .copyright { color: #64748b; font-size: 12px; }
        .help-text { color: #64748b; font-size: 14px; margin-top: 16px; line-height: 1.5; }
        .link-alternative { word-break: break-all; background: #f8fafc; padding: 12px; border-radius: 8px; margin: 16px 0; font-size: 12px; color: #475569; }
        @media (max-width: 640px) {
            .container { margin: 20px; border-radius: 12px; }
            .header, .content { padding: 24px 20px; }
            .reset-button { padding: 14px 32px; font-size: 14px; }
            .greeting { font-size: 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🔐 ReadCycle</div>
            <div class="tagline">Reset your password securely</div>
        </div>
        
        <div class="content">
            <h1 class="greeting">Hi {{name}}! 🔒</h1>
            <p class="message">
                We received a request to reset your ReadCycle account password. Click the button below to create a new secure password:
            </p>
            
            <div class="button-container">
                <a href="{{resetLink}}" class="reset-button">Reset Your Password</a>
            </div>
            
            <div class="link-alternative">
                If the button doesn't work, copy and paste this link in your browser:<br>
                <strong>{{resetLink}}</strong>
            </div>
            
            <div class="warning">
                <p class="warning-text">
                    <strong>⚠️ Security Notice:</strong> This link will expire in <strong>5 minutes</strong>. 
                    For your security, please do not share this link with anyone.
                </p>
            </div>
            
            <p class="expiry">
                Link expires in: <strong>5 minutes</strong>
            </p>
            
            <p class="help-text">
                If you didn't request this password reset, please ignore this email. Your account remains secure.
            </p>
        </div>
        
        <div class="footer">
            <p class="copyright">
                © {{year}} ReadCycle. All rights reserved.<br>
                Protecting your reading journey.
            </p>
        </div>
    </div>
</body>
</html>
`;

export const resetPasswordSuccessTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Successful - ReadCycle</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 40px 32px; text-align: center; color: white; }
        .logo { font-size: 32px; font-weight: 700; margin-bottom: 8px; }
        .tagline { font-size: 14px; opacity: 0.9; font-weight: 400; }
        .content { padding: 40px 32px; text-align: center; }
        .success-icon { font-size: 64px; margin-bottom: 24px; }
        .greeting { color: #1e293b; font-size: 28px; font-weight: 600; margin-bottom: 16px; }
        .message { color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px; }
        .success-box { background: #d1fae5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 24px; margin: 32px 0; }
        .success-text { color: #065f46; font-size: 16px; font-weight: 500; }
        .security-notice { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin: 24px 0; }
        .security-text { color: #92400e; font-size: 14px; line-height: 1.5; }
        .action-button { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 500; display: inline-block; margin: 16px 0; }
        .footer { background: #f1f5f9; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0; }
        .copyright { color: #64748b; font-size: 12px; }
        @media (max-width: 640px) {
            .container { margin: 20px; border-radius: 12px; }
            .header, .content { padding: 24px 20px; }
            .success-icon { font-size: 48px; }
            .greeting { font-size: 24px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">✅ ReadCycle</div>
            <div class="tagline">Your account security matters</div>
        </div>
        
        <div class="content">
            <div class="success-icon">🎉</div>
            <h1 class="greeting">Password Reset Successful!</h1>
            
            <div class="success-box">
                <p class="success-text">
                    ✅ Your ReadCycle account password has been successfully updated!
                </p>
            </div>
            
            <p class="message">
                Hi {{name}}, your account security is now enhanced with your new password. 
                You can continue enjoying your reading journey with peace of mind.
            </p>
            
            <a href="{{appUrl}}" class="action-button">Continue to ReadCycle</a>
            
            <div class="security-notice">
                <p class="security-text">
                    <strong>🔒 Security Check:</strong> If you didn't perform this password reset, 
                    please contact our support team immediately to secure your account.
                </p>
            </div>
            
            <p style="color: #64748b; font-size: 14px; margin-top: 24px;">
                Thank you for keeping your account secure!<br>
                Happy reading! 📖
            </p>
        </div>
        
        <div class="footer">
            <p class="copyright">
                © {{year}} ReadCycle. All rights reserved.<br>
                Keeping your literary world safe and secure.
            </p>
        </div>
    </div>
</body>
</html>
`;
export const welcomeEmailTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ReadCycle!</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 32px; text-align: center; color: white; }
        .logo { font-size: 32px; font-weight: 700; margin-bottom: 8px; }
        .tagline { font-size: 14px; opacity: 0.9; font-weight: 400; }
        .content { padding: 40px 32px; }
        .greeting { color: #1e293b; font-size: 24px; font-weight: 600; margin-bottom: 16px; }
        .message { color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px; }
        .welcome-icon { text-align: center; margin: 32px 0; }
        .icon { font-size: 64px; margin-bottom: 16px; }
        .features { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px; margin: 32px 0; }
        .feature-title { color: #065f46; font-size: 18px; font-weight: 600; margin-bottom: 16px; text-align: center; }
        .feature-list { list-style: none; space-y: 12px; }
        .feature-item { display: flex; align-items: flex-start; margin-bottom: 12px; }
        .feature-icon { color: #10b981; margin-right: 12px; flex-shrink: 0; margin-top: 2px; }
        .feature-text { color: #374151; font-size: 14px; line-height: 1.5; }
        .cta-button { text-align: center; margin: 32px 0; }
        .button { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3); transition: transform 0.2s, box-shadow 0.2s; }
        .button:hover { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(16, 185, 129, 0.4); }
        .help-section { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0; }
        .help-title { color: #1e293b; font-size: 16px; font-weight: 600; margin-bottom: 8px; }
        .help-text { color: #64748b; font-size: 14px; line-height: 1.5; }
        .footer { background: #f1f5f9; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0; }
        .copyright { color: #64748b; font-size: 12px; }
        .social-links { display: flex; justify-content: center; gap: 16px; margin: 16px 0; }
        .social-link { color: #64748b; text-decoration: none; font-size: 14px; }
        @media (max-width: 640px) {
            .container { margin: 20px; border-radius: 12px; }
            .header, .content { padding: 24px 20px; }
            .icon { font-size: 48px; }
            .greeting { font-size: 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">📚 ReadCycle</div>
            <div class="tagline">Empowering learners, sharing knowledge</div>
        </div>
        
        <div class="content">
            <h1 class="greeting">Welcome to ReadCycle, {{name}}! 🎉</h1>
            
            <div class="welcome-icon">
                <div class="icon">👋</div>
            </div>
            
            <p class="message">
                We're thrilled to welcome you to our educational community! Get ready to discover, share, 
                and exchange knowledge with fellow learners and educators.
            </p>
            
            <div class="features">
                <h3 class="feature-title">Here's what you can do on ReadCycle:</h3>
                <ul class="feature-list">
                    <li class="feature-item">
                        <span class="feature-icon">📖</span>
                        <span class="feature-text"><strong>Buy & Sell Textbooks</strong> - Find affordable course materials or sell books you no longer need</span>
                    </li>
                    <li class="feature-item">
                        <span class="feature-icon">🔄</span>
                        <span class="feature-text"><strong>Book Exchange</strong> - Trade books with other students in your area</span>
                    </li>
                    <li class="feature-item">
                        <span class="feature-icon">💬</span>
                        <span class="feature-text"><strong>Connect with Peers</strong> - Chat with other students and educators</span>
                    </li>
                    <li class="feature-item">
                        <span class="feature-icon">🎯</span>
                        <span class="feature-text"><strong>Find Course Materials</strong> - Get the exact books you need for your classes</span>
                    </li>
                </ul>
            </div>

            <div class="cta-button">
                <a href="{{appUrl}}" class="button">Start Exploring ReadCycle</a>
            </div>
            
            <div class="help-section">
                <h4 class="help-title">Need Help Getting Started?</h4>
                <p class="help-text">
                    Check out our <a href="{{appUrl}}/help" style="color: #10b981; text-decoration: none;">help center</a> for guides on how to list books, 
                    make purchases, and connect with other members of our educational community.
                </p>
            </div>
            
            <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 24px;">
                Happy learning!<br>
                The ReadCycle Team 📚
            </p>
        </div>
        
        <div class="footer">
            <div class="social-links">
                <a href="#" class="social-link">Help Center</a>
                <a href="#" class="social-link">Contact Support</a>
                <a href="#" class="social-link">Community Guidelines</a>
            </div>
            <p class="copyright">
                © {{year}} ReadCycle. All rights reserved.<br>
                Building a sustainable educational community, one book at a time.
            </p>
        </div>
    </div>
</body>
</html>
`;

