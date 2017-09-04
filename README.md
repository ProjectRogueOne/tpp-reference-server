
# TPP Middleware

## What this does 


Login endpoint whcih handles sessions.js 
POST to this with a username and password, 
look for a match in the database 
if the match is made then a session ID is made




Session checker - is there a session currrently in the database for this user ? 

```
{
    session: {
      sid: guid,
      lasttouch: int
      ttl: int
      uid: string
    }
}


```

Users:   
username  
salt  
pwhash  
email  
password  




