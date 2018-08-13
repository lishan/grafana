+++
title = "OAuth authentication"
description = "Grafana OAuthentication Guide "
keywords = ["grafana", "configuration", "documentation", "oauth"]
type = "docs"
[menu.docs]
name = "OAuth"
identifier = "oauth"
parent = "authentication"
weight = 2
+++

# OAuth Authentication

## [auth.generic_oauth]

This option could be used if have your own oauth service.

This callback URL must match the full HTTP address that you use in your
browser to access Grafana, but with the prefix path of `/login/generic_oauth`.

```bash
[auth.generic_oauth]
enabled = true
client_id = YOUR_APP_CLIENT_ID
client_secret = YOUR_APP_CLIENT_SECRET
scopes =
auth_url =
token_url =
api_url =
allowed_domains = mycompany.com mycompany.org
allow_sign_up = true
```

Set api_url to the resource that returns [OpenID UserInfo](https://connect2id.com/products/server/docs/api/userinfo) compatible information.

### Set up oauth2 with Okta

First set up Grafana as an OpenId client "webapplication" in Okta. Then set the Base URIs to `https://<grafana domain>/` and set the Login redirect URIs to `https://<grafana domain>/login/generic_oauth`.

Finally set up the generic oauth module like this:
```bash
[auth.generic_oauth]
name = Okta
enabled = true
scopes = openid profile email
client_id = <okta application Client ID>
client_secret = <okta application Client Secret>
auth_url = https://<okta domain>/oauth2/v1/authorize
token_url = https://<okta domain>/oauth2/v1/token
api_url = https://<okta domain>/oauth2/v1/userinfo
```

### Set up oauth2 with Bitbucket

```bash
[auth.generic_oauth]
name = BitBucket
enabled = true
allow_sign_up = true
client_id = <client id>
client_secret = <client secret>
scopes = account email
auth_url = https://bitbucket.org/site/oauth2/authorize
token_url = https://bitbucket.org/site/oauth2/access_token
api_url = https://api.bitbucket.org/2.0/user
team_ids =
allowed_organizations =
```

### Set up oauth2 with OneLogin

1.  Create a new Custom Connector with the following settings:
    - Name: Grafana
    - Sign On Method: OpenID Connect
    - Redirect URI: `https://<grafana domain>/login/generic_oauth`
    - Signing Algorithm: RS256
    - Login URL: `https://<grafana domain>/login/generic_oauth`

    then:
2.  Add an App to the Grafana Connector:
    - Display Name: Grafana

    then:
3.  Under the SSO tab on the Grafana App details page you'll find the Client ID and Client Secret.

    Your OneLogin Domain will match the url you use to access OneLogin.

    Configure Grafana as follows:

    ```bash
    [auth.generic_oauth]
    name = OneLogin
    enabled = true
    allow_sign_up = true
    client_id = <client id>
    client_secret = <client secret>
    scopes = openid email name
    auth_url = https://<onelogin domain>.onelogin.com/oidc/auth
    token_url = https://<onelogin domain>.onelogin.com/oidc/token
    api_url = https://<onelogin domain>.onelogin.com/oidc/me
    team_ids =
    allowed_organizations =
    ```

### Set up oauth2 with Auth0

1.  Create a new Client in Auth0
    - Name: Grafana
    - Type: Regular Web Application

2.  Go to the Settings tab and set:
    - Allowed Callback URLs: `https://<grafana domain>/login/generic_oauth`

3. Click Save Changes, then use the values at the top of the page to configure Grafana:

    ```bash
    [auth.generic_oauth]
    enabled = true
    allow_sign_up = true
    team_ids =
    allowed_organizations =
    name = Auth0
    client_id = <client id>
    client_secret = <client secret>
    scopes = openid profile email
    auth_url = https://<domain>/authorize
    token_url = https://<domain>/oauth/token
    api_url = https://<domain>/userinfo
    ```

### Set up oauth2 with Azure Active Directory

1.  Log in to portal.azure.com and click "Azure Active Directory" in the side menu, then click the "Properties" sub-menu item.

2.  Copy the "Directory ID", this is needed for setting URLs later

3.  Click "App Registrations" and add a new application registration:
    - Name: Grafana
    - Application type: Web app / API
    - Sign-on URL: `https://<grafana domain>/login/generic_oauth`

4.  Click the name of the new application to open the application details page.

5.  Note down the "Application ID", this will be the OAuth client id.

6.  Click "Settings", then click "Keys" and add a new entry under Passwords
    - Key Description: Grafana OAuth
    - Duration: Never Expires

7.  Click Save then copy the key value, this will be the OAuth client secret.

8.  Configure Grafana as follows:

    ```bash
    [auth.generic_oauth]
    name = Azure AD
    enabled = true
    allow_sign_up = true
    client_id = <application id>
    client_secret = <key value>
    scopes = openid email name
    auth_url = https://login.microsoftonline.com/<directory id>/oauth2/authorize
    token_url = https://login.microsoftonline.com/<directory id>/oauth2/token
    api_url =
    team_ids =
    allowed_organizations =
    ```

<hr>

## [auth.github]

You need to create a GitHub OAuth application (you find this under the GitHub
settings page). When you create the application you will need to specify
a callback URL. Specify this as callback:

```bash
http://<my_grafana_server_name_or_ip>:<grafana_server_port>/login/github
```

This callback URL must match the full HTTP address that you use in your
browser to access Grafana, but with the prefix path of `/login/github`.
When the GitHub OAuth application is created you will get a Client ID and a
Client Secret. Specify these in the Grafana configuration file. For
example:

```bash
[auth.github]
enabled = true
allow_sign_up = true
client_id = YOUR_GITHUB_APP_CLIENT_ID
client_secret = YOUR_GITHUB_APP_CLIENT_SECRET
scopes = user:email,read:org
auth_url = https://github.com/login/oauth/authorize
token_url = https://github.com/login/oauth/access_token
api_url = https://api.github.com/user
team_ids =
allowed_organizations =
```

Restart the Grafana back-end. You should now see a GitHub login button
on the login page. You can now login or sign up with your GitHub
accounts.

You may allow users to sign-up via GitHub authentication by setting the
`allow_sign_up` option to `true`. When this option is set to `true`, any
user successfully authenticating via GitHub authentication will be
automatically signed up.

### team_ids

Require an active team membership for at least one of the given teams on
GitHub. If the authenticated user isn't a member of at least one of the
teams they will not be able to register or authenticate with your
Grafana instance. For example:

```bash
[auth.github]
enabled = true
client_id = YOUR_GITHUB_APP_CLIENT_ID
client_secret = YOUR_GITHUB_APP_CLIENT_SECRET
scopes = user:email,read:org
team_ids = 150,300
auth_url = https://github.com/login/oauth/authorize
token_url = https://github.com/login/oauth/access_token
api_url = https://api.github.com/user
allow_sign_up = true
```

### allowed_organizations

Require an active organization membership for at least one of the given
organizations on GitHub. If the authenticated user isn't a member of at least
one of the organizations they will not be able to register or authenticate with
your Grafana instance. For example

```bash
[auth.github]
enabled = true
client_id = YOUR_GITHUB_APP_CLIENT_ID
client_secret = YOUR_GITHUB_APP_CLIENT_SECRET
scopes = user:email,read:org
auth_url = https://github.com/login/oauth/authorize
token_url = https://github.com/login/oauth/access_token
api_url = https://api.github.com/user
allow_sign_up = true
# space-delimited organization names
allowed_organizations = github google
```

<hr>

## [auth.google]

First, you need to create a Google OAuth Client:

1. Go to https://console.developers.google.com/apis/credentials

2. Click the 'Create Credentials' button, then click 'OAuth Client ID' in the
menu that drops down

3. Enter the following:

   - Application Type: Web Application
   - Name: Grafana
   - Authorized Javascript Origins: https://grafana.mycompany.com
   - Authorized Redirect URLs: https://grafana.mycompany.com/login/google

   Replace https://grafana.mycompany.com with the URL of your Grafana instance.

4. Click Create

5. Copy the Client ID and Client Secret from the 'OAuth Client' modal

Specify the Client ID and Secret in the Grafana configuration file. For example:

```bash
[auth.google]
enabled = true
client_id = CLIENT_ID
client_secret = CLIENT_SECRET
scopes = https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email
auth_url = https://accounts.google.com/o/oauth2/auth
token_url = https://accounts.google.com/o/oauth2/token
allowed_domains = mycompany.com mycompany.org
allow_sign_up = true
```

Restart the Grafana back-end. You should now see a Google login button
on the login page. You can now login or sign up with your Google
accounts. The `allowed_domains` option is optional, and domains were separated by space.

You may allow users to sign-up via Google authentication by setting the
`allow_sign_up` option to `true`. When this option is set to `true`, any
user successfully authenticating via Google authentication will be
automatically signed up.