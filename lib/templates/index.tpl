<!DOCTYPE html>
<html>
<head>
    <title>Node Monkey</title>

    <link rel="stylesheet" type="text/css" href="/css/style.css" />
    <script data-main="scripts/main" src="/lib/require.js"></script>
<head>
<body>
    <div id="pwd-prompt">
        <div class="auth-error-wrapper"><div class="auth-error"></div></div>
        <div class="field-label">Username:</div><div class="field"><input id="username" type="text" /></div><br />
        <div class="field-label">Password:</div><div class="field"><input id="password" type="password" /></div>
        <div><button id="login-btn">Login</button></div>
    </div>

    <% if(secure) { %>
    <div style="color: #0F0;">Connection is secure</div>
    <% } else { %>
    <div style="color: #F00;">Connection is NOT secure!</div>
    <% } %>
    Connection Status: <span id="con-status">--</span><br />
    Open your console to see output<br /><br />

    <div id="error"></div>
</body>
</html>