// Set conditions to tokens.
var ConditionScript = (function()
{
	'use strict';

	// add mechanics to declare conditions and use them in macro like !toggle-condition stunned
	//    or !add-conditions --target --conditions "entangled,distracted"
	// use Class pattern from Roll20
	// rename class SWCondition or maybe create too classes ConditionScript and SWConditions
	// declare effects when receiving the condition

	function registerEventHandlers()
	{
		apicmd.on(
			'status-markers',
			'List existing markets.',
			'',
			[],
			handleListMarkers
		);

    apicmd.on(
      'status-toggle',
      'Toggle a status on a target.',
      '--target TOKENID --status MARKERID [--color HTMLCOLOR --whenreceived MESSAGE --whendropped MESSAGE]',
      [
        ['-t', '--target TOKENID', 'ID of the token to toggle status on.'],
        ['-s', '--status MARKERID', 'ID of the marker to set. Should look like name::12345.'],
				['-c', '--color HTMLCOLOR', 'html code of the color when announced to chat.'],
				['-r', '--whenreceived MESSAGE', 'message to display when status is added.'],
				['-d', '--whendropped MESSAGE', 'message to display when status is removed.'],
      ],
      handleToggleStatus
    )

    log("Savage Worlds Conditions Script started.");
	}

  function handleListMarkers (argv, msg)
	{
    var gameMarkers = JSON.parse(Campaign().get("token_markers"));

    sendChat("api", "/w gm Existing markers in this game: " + _getMarkersAsHtml(gameMarkers) + ".");
  }

  function handleToggleStatus (argv, msg)
  {
    if (!argv || !argv.opts || !argv.opts.target || !argv.opts.status) {
			sendChat("api", "/w gm --target and --status are mandatory.");
			return;
		}

		var color = argv.opts.color || 'darkolivegreen';

    var status = argv.opts.status;
    var gameMarkers = JSON.parse(Campaign().get("token_markers"));
    var result = _.find(gameMarkers, marker => {
        return marker.tag === status;
    });

    if (!result) {
      sendChat("api", `/w gm No status by name '${status}' found in the game. Try !status-markers.`);
      return;
    }

		var whenreceived = argv.opts.whenreceived || 'receives status ' + status + '.';
		var whendropped = argv.opts.whendropped || 'loses status ' + status + '.';

    var target = getObj("graphic", argv.opts.target);
    if (!target) {
      sendChat("api", `/w gm No target by ID '${argv.opts.target}' found in the game.`);
      return;
    }

    var targetName = _getNiceName(target);
    var targetMarkers = target.get("statusmarkers").split(',');
    if (targetMarkers.find(current => {return current == status;})) { // Already set ? → Turn it off
      targetMarkers = targetMarkers.filter(current => { return current != status;});
      target.set("statusmarkers", targetMarkers.join(','));
			_nicelySendToChat(target.get("imgsrc"), targetName, color, whendropped);
    } else { // Not set, Turn it on
        targetMarkers.push(status);
        target.set("statusmarkers", targetMarkers.join(','));
				_nicelySendToChat(target.get("imgsrc"), targetName, color, whenreceived);
    }
  }

  function _getMarkersAsHtml(markers)
  {
    let chatMessage = '';
    _.each(markers, marker => {
           chatMessage += `<p><img src='${marker.url}'> ${marker.name}::${marker.id}</p>`;
    });
    return chatMessage;
  }

  function _getNiceName(target)
  {
    return (target.get("name") === "" || target.get("showname") === false) ? "NPC" : target.get("name");
  }

  function _nicelySendToChat(picture, name, color, message)
  {
      var beautified = "" +
          "<div style='display: block; margin-left: -7px; margin-right: 2px; padding: 2px 0px;'>" +
              "<div style='position: relative; border: 1px solid #000; border-radius: 5px; background-color:" + color + "; background-image: linear-gradient(rgba(255, 255, 255, .3), rgba(255, 255, 255, 0)); margin-right: -2px; padding: 2px 5px 5px 50px;'>" +
                  "<div style='position: absolute; top: -10px; left: 5px; height: 40px; width: 40px;'>" +
                      "<img src='" + picture + "' style='height: 40px; width: 40px;'></img>" +
                  "</div>" +
                  "<div style='font-family: Candal; font-size: 13px; line-height: 15px; color: #FFF; font-weight: normal; text-align: center; '>" +
                      name + " " + message + "." +
                  "</div>" +
              "</div>" +
          "</div>";

      sendChat('', '/desc ' + beautified);
  }

  return {
		registerEventHandlers: registerEventHandlers,
	}


}());

on("ready", function()
{
	ConditionScript.registerEventHandlers();
});
