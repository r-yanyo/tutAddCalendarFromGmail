function doGet(){
  var EmailBody = "今回カレンダーに追加されたイベント:";
  //例) createEvent("サーチするメールのラベル","キーワード","イベントを追加するカレンダー名");
  EmailBody += createEvent("豊橋技科大","補講","TUT授業");
  EmailBody += createEvent("豊橋技科大","休講","TUT授業");
  EmailBody += createEvent("豊橋技科大","教室変更","TUT授業");
  GmailApp.sendEmail(Session.getActiveUser().getEmail(), "TUT休講・補講・教室変更追加イベント",EmailBody);
  return HtmlService.createHtmlOutput('success.');
}

function createEvent(LabelName,EventName,CalendarName){
  var threads = GmailApp.getUserLabelByName(LabelName).getThreads();

  for (var i=0; i<threads.length; i++){
    var thread = threads[i];
    var messages = thread.getMessages();
    for(var j=0; j<messages.length; j++){
      var message = messages[j];
      if(message.getSubject().indexOf(EventName)>=0){
        var body = message.getBody();
        body = body.substr(body.indexOf("----------  以下メッセージ  -----------"));
        
        var regExp_date = new RegExp(/\d{4}\/\d{2}\/\d{2}/g);
        var regExp_class = new RegExp(/時間割名.*/g);
        var regExp_dateNum = new RegExp(/時限.*限/g);
        var regExp_time = new RegExp(/時間.*\d{2}:\d{2}～\d{2}:\d{2}/g);
        
        var class = body.match(regExp_class)[0].replace("時間割名：","");
        var date = body.match(regExp_date);
        var time = body.match(regExp_time);
        var dateNum = body.match(regExp_dateNum)[0].replace("時限：","");
        
        //[0]を使用したので、timeが複数ヒットするとバグるかも
        var from = new Date(date+" "+time[0].slice(3,8)); //引数例) 2017/06/28 13:00
        var to = new Date(date+" "+time[0].slice(9,15));
       
        //デバッグ用
        //Logger.log(class+' '+dateNum+' '+date);
        //Logger.log(body);
        
        //Note:[0]を使用したので、CalendarNameを持つカレンダーが複数あるとバグるかも
        var myCalendar = CalendarApp.getCalendarsByName(CalendarName)[0];
        //該当するカレンダーが無かったら新しく作る
        if(myCalendar === undefined) myCalendar = CalendarApp.createCalendar(CalendarName,{timeZone: "Japan"});
        
        var existingEvents = myCalendar.getEvents(from, to, {search: EventName});
        var title = EventName+" "+dateNum+" "+class;
        var EmailBody="";
        if(existingEvents.length == 0){
          myCalendar.createEvent(title,from,to,{description: body});
          Logger.log("追加イベント:"+title+" "+date);
          EmailBody += title+" "+date+"\n";
        }
        else{
          Logger.log("登録済みイベント:"+title+" "+date);
        }
      }
    }
  }
  return EmailBody;
}
