import os

import requests

config = {
    "github":{"url":'https://github.com/login/oauth/access_token',
              "client_id":os.environ.get('GITHUB_CLIENT_ID',''),
              "client_secret":os.environ.get('GITHUB_CLIENT_SECRET','')},
    "google":{"url":"","client_id":"","client_secret":''},
}
def verify_github_token(token):
    print("Verify Token(Github)!",token)
    cfg = config['github']
    data = {'client_id':cfg['client_id'],'client_secret':cfg['client_secret'],'code':token}
    result = requests.post(cfg['url'],data,headers={"Accept":"application/json"}).json()
    user = requests.get("https://api.github.com/user",headers={"Accept":"application/json","Authorization":f"Token {result['access_token']}"}).json()
    # gists = requests.get("https://api.github.com/gists",headers={"Accept":"application/json","Authorization":f"Token {result['access_token']}"}).json()
    # print("GOT GITHUB USER RESULT!",user)
    # print("GOT GITHUB GIST RESULT!",gists)
    return user

def verify_google_token(token):
    uri = "https://www.googleapis.com/oauth2/v3/userinfo"
    resp = requests.get(uri, headers={"Authorization": f"Bearer {token}"})
    user_info = resp.json()
    print("GOT INFO:",user_info)
    user_info['short_name'] = user_info['given_name'] + ' ' + user_info['family_name'][:1]
    return user_info
