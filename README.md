# ConditionsScript
Roll20 script to help applying commonly used status markers for commonly used conditions.

## Setup
You need a Roll20 Pro Subscription to be able to use API Scripts.

You will need to install two scripts :
* apicmd.js that you can find [apicmd GitHub](https://gist.github.com/goblinHordes/7424738)
* this SWConditions.js script from [Gronyon's GitHub](https://github.com/gronyon/SWConditions)

apicmd is used to parse the ConditionScript input (why reinvent the wheel when it has already been created and nicely round ?).

## API Commands
### Listing status markers
Before you can create conditions and apply status markers to tokens, you need to know the unique tag for those markers.
With the recent addition to Custom Status Markers to Roll20 the status name is not enough. You need the status "tag" which looks like a name and an ID: **name::12345**
```javascript
!status-markers
```

### Toggle status marker
Once you have a status marker tag, you can toggle it on a token.
It will check whether the marker is already there and remove it, or not yet and apply it. Then, it announces to all players in chat.
```javascript
!status-toggle --target TOKENID --status MARKERID --color HTMLCOLOR --whenreceived MESSAGE --whendropped MESSAGE
```

You can make it as a macro and set it in your macrobar:
```javascript
!status-toggle --target @{selected|token_id} --status stunned::45897 --color teal --whenreceived "is Stunned" --whendropped "recovers"
```
