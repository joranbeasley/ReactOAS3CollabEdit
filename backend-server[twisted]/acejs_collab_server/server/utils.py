import requests


def googleLogin(authToken):
    uri = "https://www.googleapis.com/oauth2/v3/userinfo"
    resp = requests.get(uri, headers={"Authorization": f"Bearer {authToken}"})
    user_info = resp.json()
    user_info['short_name'] = user_info['given_name'] + ' ' + user_info['family_name'][:1]
    return user_info
