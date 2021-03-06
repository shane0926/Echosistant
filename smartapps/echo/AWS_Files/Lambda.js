/**
 *  EchoSistant - Lambda Code
 *
 *  Version 4.0.0 -2/17/2017 Public Release
 * 
 *  Special thanks for Michael Struck @MichaelS (Developer of AskAlexa) for allowing me
 *  to build off of his base code.  Special thanks to Keith DeLong  @N8XD for his 
 *  assistance in troubleshooting.... as I learned.....  Special thanks to Bobby
 *  @SBDOBRESCU for jumping on board and being a co-consipirator in this adventure.
 *
 *  Version 3.0.0 - 12/1/2016  Added new parent variables
 *  Version 2.0.0 - 11/20/2016  Continued Commands
 * 
 *  Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License. You may obtain a copy of the License at:
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed
 *  on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License
 *  for the specific language governing permissions and limitations under the License.
 *
 */
'use strict';
exports.handler = function( event, context ) {
    var https = require( 'https' );
    // Paste app code here between the breaks------------------------------------------------
    var STappID = 'XXXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX';
    var STtoken = 'XXXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX';
    var url='https://graph.api.smartthings.com:443/api/smartapps/installations/' + STappID + '/' ;
        //---------------------------------------------------------------------------------------
        var cardName ="";
        var areWeDone = true;
//-------- Validation process and begining interaction with SmartThings app-------------------- 
        var versionTxt = '4.0';
        var versionDate= '2/17/2017';
        var releaseTxt = "4.0.00";
        var intentResp = "noAction";
        if (event.request.type == "IntentRequest"){
            intentResp = event.request.intent.name;
        }
        var beginURL = url + 'b?&versionTxt=' + versionTxt + '&intentResp=' + intentResp + '&versionDate=' + versionDate + '&releaseTxt=' + releaseTxt + '&access_token=' + STtoken;
        https.get( beginURL, function( response ) {
        response.on( 'data', function( data ) {
            var startJSON = JSON.parse(data);
            var pMuteAlexa = startJSON.pContinue; //setting global variable if Alexa feedback is allowed
            var short = startJSON.pShort; //setting global variable for short answers
            var verST = startJSON.versionSTtxt;
            var pPendingAns = startJSON.pPendingAns;
            var text = startJSON.outputTxt;
//-------- Error trapping--------------------------------------------------------------------
            if (startJSON.error) { 
                output("There was an error. If this continues to happen, please reach out for help", context, "Lambda Error", areWeDone); 
            }
            if (startJSON.error === "invalid_token" || startJSON.type === "AccessDenied") {
                output("There was an error accessing the SmartThings cloud environment. Please check your security token and application ID and try again. ", context, "Lambda Error", areWeDone); 
            }
            if (verST != versionTxt) { 
                output("You are using outdated smart apps. Please make sure to update both the Lambda code and the SmartThings code to most recent versions, and then try again.", context, "Lambda Error", areWeDone);
            }
//-------- Begining Request------------------------------------------------------------------            
            if (event.request.type == "LaunchRequest") { 
                alexaResp ("LaunchRequest", context, areWeDone, short); 
            }
            else if (event.request.type == "SessionEndedRequest"){}
            else if (event.request.type == "IntentRequest") {
                var process = false;
                var intentName = event.request.intent.name;
                if (intentName == "AMAZON.YesIntent" && pPendingAns == "level") {
                    alexaResp ("Pending Yes Level", context, "Amazon Intent", areWeDone, short); 
                }
                else if (intentName == "AMAZON.YesIntent" && pPendingAns == "door") {
                    areWeDone=true;
                    return output(text, context, cardName, areWeDone);
                }
                else if (intentName == "AMAZON.YesIntent" && pPendingAns == "caps" && short !== true) {
                    areWeDone=false;
                    text = text + ", would you like anything else?";
                    return output(text, context, cardName, areWeDone);
                }
                else if (intentName == "AMAZON.YesIntent" && pPendingAns == "caps" && short === true ) {
                    areWeDone=false;
                    text = text + ", anything else?";
                    return output(text, context, cardName, areWeDone);
                }
                else if (intentName == "AMAZON.YesIntent" && pPendingAns == "pin") {
                    areWeDone=false;
                    return output(text, context, cardName, areWeDone);
                }
                else if (intentName == "AMAZON.YesIntent" && pPendingAns == "feedback") {
                    areWeDone=true;
                    return output(text, context, cardName, areWeDone);
                }
                else if (intentName == "AMAZON.NoIntent" && pPendingAns == "level") {
                    areWeDone=false;
                    text = text + ', is it better?';
                    return output(text, context, cardName, areWeDone);
                }
                else if (intentName.startsWith("AMAZON") && intentName.endsWith("Intent")) { 
                    alexaResp (intentName, context, "Amazon Intent", areWeDone, short); 
                }
//-------- Devicce Control Type Request------------------------------------------------------------------
                else if (intentName == "main"){           
                    var cCommand = event.request.intent.slots.cCommand.value;
                    var cNum = event.request.intent.slots.cNum.value;
                    var cPIN = event.request.intent.slots.cPIN.value;
                    var cDevice = event.request.intent.slots.cDevice.value;
                    var cUnit = event.request.intent.slots.cUnit.value;
                    var cGroup = event.request.intent.slots.cGroup.value;
                    url += 'c?cDevice=' + cDevice + '&cGroup=' + cGroup + '&cCommand=' + cCommand + '&cNum=' + cNum + '&cPIN=' + cPIN + '&cUnit=' + cUnit + '&intentName=' + intentName;    
                    process = true;
                    cardName = "EchoSistant Control";
                }
//-------- Security Control Type Request------------------------------------------------------------------
                else if (intentName == "security"){           
                    var sCommand = event.request.intent.slots.cCommand.value;
                    var sNum = event.request.intent.slots.cNum.value;
                    var sPIN = event.request.intent.slots.cPIN.value;
                    var sType = event.request.intent.slots.sType.value;
                    var sControl = event.request.intent.slots.sControl.value;
                    url += 's?sControl=' + sControl + '&sCommand=' + sCommand + '&sType=' + sType + '&sNum=' + sNum + '&sPIN=' + sPIN + '&intentName=' + intentName;    
                    process = true;
                    cardName = "EchoSistant Security";
                }
//-------- Feedback Type Request------------------------------------------------------------------
                else if (intentName == "feedback"){           
                    var fDevice = event.request.intent.slots.cDevice.value;
                    var fQuery = event.request.intent.slots.fQuery.value;
                    var fOperand = event.request.intent.slots.fOperand.value;
                    var fCommand = event.request.intent.slots.cCommand.value;

                    url += 'f?fDevice=' + fDevice + '&fCommand=' + fCommand + '&fQuery=' + fQuery + '&fOperand=' + fOperand + '&intentName=' + intentName;
                    process = true;
                    cardName = "EchoSistant Feedback";
                }
//-------- TTS Type Request------------------------------------------------------------------
                else if (intentName != "main" || intentName != "security" || intentName != "feedback") {
                    var ttstext = event.request.intent.slots.ttstext.value;
                    url += 't?ttstext=' + ttstext + '&intentName=' + intentName;
                    process = true;
                    cardName = "EchoSistant Free Text";
                }
//-------- General Response------------------------------------------------------------------
                if (!process) {
                    output("I am not sure what you are asking. Please try again", context, areWeDone); 
                }
                else {
                    url += '&access_token=' + STtoken;
                    https.get( url, function( response ) {
                        response.on( 'data', function( data ) {
                        var resJSON = JSON.parse(data);
                        var pContCmds = resJSON.pContCmds;
                        var pContCmdsR = resJSON.pContCmdsR;
                        var pTryAgain = resJSON.pTryAgain;
                        var short = resJSON.pShort;
                        var pPIN = resJSON.pPIN;
                        var speechText = resJSON.outputTxt;
                        if (pPIN === true){
                            //just wait
                            areWeDone=false;
                        }
                        else if (pMuteAlexa === true && pTryAgain !== true) {
                            areWeDone=true;
                            return output("", context, cardName, areWeDone);
                        }    
                        else if (pContCmds === true && pContCmdsR == "profile" ) { 
                            areWeDone=false;
                            speechText = speechText + ', send another message to ' + intentName;
                            return output(speechText, context, cardName, areWeDone);
                        }
                        else if (pContCmds === true && pContCmdsR == "level" ) { 
                            areWeDone=false;
                            speechText = speechText + ', is it better?';
                            return output(speechText, context, cardName, areWeDone);
                        }
                        else if (pContCmds === true && pContCmdsR == "door" ) { 
                            areWeDone=false;
                            return output(speechText, context, cardName, areWeDone);
                        }
                        else if (pContCmds === true && pContCmdsR == "feedback"){
                            //just wait
                            areWeDone=false;
                        }
                        else if (pContCmds === true && pContCmdsR == "caps"){
                            //just wait
                            areWeDone=false;                            
                        } 
                        else if (pContCmds === true && pContCmdsR == "bat"){
                            //just wait
                            areWeDone=false;                            
                        }
                        else if (pContCmds === true && pContCmdsR == "act"){
                            //just wait
                            areWeDone=false;                            
                        } 
                        else if (pContCmds === true && pContCmdsR == "stayORleave"){
                            //just wait
                            areWeDone=false;                            
                        } 
                        else if (pTryAgain === true){
                            alexaContResp ("Try Again", speechText, context, areWeDone, short);
                        }
                        else if (pContCmdsR == "reminder"){
                            //just wait
                            areWeDone=false;
                        }                        
                        else if (pPIN === true){
                            //just wait
                            areWeDone=false;
                        }
                        else if (pContCmds === true) {
                            alexaContResp ("Response", speechText, context, areWeDone, short);
                        }
                        else if (pContCmds === false){
                            //no sound
                            areWeDone=true;
                        }
                        output(speechText, context, cardName, areWeDone);
                        } );
                    } );
                }
            }
        } );
    } );
};
function alexaResp(type, context, cardName, areWeDone, short){
    if (type == "AMAZON.YesIntent") { 
        areWeDone=false;
        output("Please continue, ", context, "EchoSistant Continue", areWeDone);
    }
    else if (type == "AMAZON.NoIntent" && short === false) { 
        areWeDone=true;
        output(" It has been my pleasure.  Goodbye ", context, "EchoSistant Stop", areWeDone);
    }
    else if (type == "AMAZON.NoIntent" && short === true) { 
        areWeDone=true;
        output(" Ok ", context, "EchoSistant Stop", areWeDone);
    }    
    else if (type == "AMAZON.StopIntent" || type == "AMAZON.CancelIntent") { 
        areWeDone=true;
        output(" Cancelling", context, "EchoSistant Stop", areWeDone);
    }
    else if (type == "Pending Yes Level" && short !== true){
        areWeDone=true;
        output(" Great, I am here if you need me.", context, "EchoSistant Stop", areWeDone);
    }
    else if (type == "Pending Yes Level" && short === true){
        areWeDone=true;
        output(" Ok", context, "EchoSistant Stop", areWeDone);
    }    
    else if (type == "Pending Yes Door"){
        areWeDone=true;
        output(" Ok,", context, "EchoSistant Continue", areWeDone);
    }
    else if (type == "LaunchRequest" && short !== true){
        areWeDone=false;
        output(" how may I help you? ", context, "EchoSistant Continue", areWeDone);
    } 
    else if (type == "LaunchRequest" && short === true){
        areWeDone=false;
        output(" What's up? ", context, "EchoSistant Continue", areWeDone);
    }     
}
function alexaContResp(type, text , context, areWeDone, short){
    var speechText = text;
    if (type == "Try Again" && short !== true ) { 
        speechText = speechText + ',  would you like to try again? '; 
        areWeDone=false;
        output(speechText, context, "EchoSistant Try Again", areWeDone);
    }
    if (type == "Try Again" && short === true) { 
        speechText = speechText + ',  try again? '; 
        areWeDone=false;
        output(speechText, context, "EchoSistant Try Again", areWeDone);
    }    
    else if (type == "PIN" && short !== true) { 
        areWeDone=false;
        speechText = "Pin number, please";
        output(speechText, context, "EchoSistant Pin Request", areWeDone);
    }
    else if (type == "PIN" && short === true) { 
        areWeDone=false;
        speechText = "Pin number?";
        output(speechText, context, "EchoSistant Pin Request", areWeDone);
    }    
    else if (type == "Response" && short !== true) { 
        areWeDone=false;
        speechText =speechText + " , would you like anything else";
        output(speechText, context, "EchoSistant Continue", areWeDone);
    }
    else if (type == "Response" && short === true) { 
        areWeDone=false;
        speechText =speechText + " , anything else?";
        output(speechText, context, "EchoSistant Continue", areWeDone);
    }
}
function output( text, context, cardName, areWeDone) {
        var response = {
             outputSpeech: {
             type: "PlainText",
             text: text
                 },
                 card: {
                 type: "Simple",
                 title: cardName,
                 content: text
                    },
        shouldEndSession: areWeDone
        };
        context.succeed( { response: response } );
  }
