
var rest_name;
var table_no;
var seat_no;

var clickScan = function() {
    
    window.plugins.barcodeScanner.scan(scannerSuccess, scannerFailure);        
}

function scannerSuccess(result) {
    console.log("scannerSuccess: result: " + result.text.toString());
    
    if (result.text.length > 0) {
        
        localStorage.setItem('barcode', result.text.toString()); 
    
        var arrayOfValues = result.text.toString().split(";");
        
        if (arrayOfValues.length != 5) {
            toast('QR Code not valid!');
            
            //return false;
        }
        else {
            localStorage.setItem('restaurantName', arrayOfValues[0]);
            localStorage.setItem('tableNumber', arrayOfValues[1]);
            localStorage.setItem('seatNumber', arrayOfValues[2]);
            //localStorage.setItem('latitude', arrayOfValues[3]);
            //localStorage.setItem('longitude', arrayOfValues[4]);

            rest_name = localStorage.getItem('restaurantName');
            table_no = localStorage.getItem('tableNumber');
            seat_no = localStorage.getItem('seatNumber');
        
            $('#barcodeimg').attr("src","images/scanned.png");
        
            processResult();
        }
    }
}

var toast=function(msg){
	$("<div class='ui-loader ui-overlay-shadow ui-body-e ui-corner-all'><h3>"+msg+"</h3></div>")
	.css({ display: "block",
         opacity: 0.90,
         position: "fixed",
         padding: "5px",
         "text-align": "center",
         width: "150px",
         left: ($(window).width())/2,
         top: $(window).height()/2 })
        .appendTo( $.mobile.pageContainer ).delay( 1500 )
        .fadeOut( 400, function(){
             $(this).remove();
             });
}


//------------------------------------------------------------------------------
function scannerFailure(message) {
    console.log("scannerFailure: message: " + message);
}

function checkIn() {
	var uuid = localStorage.getItem('uuid');	
	var Barcode = localStorage.getItem('barcode');
	var Location = localStorage.getItem('latitude') + "," + localStorage.getItem('longitude');
	var Action = 1;
	//var localtime = new Date().getTime();
	var now = new Date();
	var d = now.getTime();
    //offset = now.getTimezoneOffset() * 60 * 1000,
    //yourUnixStamp = userUnixStamp - offset;
	//alert(now);
    
    
	try 
    {
    	$.mobile.loadingMessageTextVisible=true;
        $.mobile.loadingMessage = "Check-In...";
        $.mobile.showPageLoadingMsg();
        
        $.ajax({
               type: "POST",
               url: "http://peaceful-escarpment-2232.herokuapp.com/services/multidine/CreateEntry",
               data: JSON.stringify({"UDId": uuid, "Data": Barcode, "Location": Location,"TimeofCheckIn": d, "ActionTypeId": Action}),    
               contentType: "application/json",
               dataType: "json",
               success: ajaxCallSucceed,
               failure: ajaxCallFailed
               });
        
        return true;
    }
    catch (e) 
    {
        $.mobile.hidePageLoadingMsg();
        console.log(e.toString());
        return false;
	}	
	
	function ajaxCallSucceed(response) 
	{             
  		$.mobile.hidePageLoadingMsg();
        console.log(response);
        
        //var data = 
        
        alert(JSON.stringify(response)+"::::"+d);
	}
    
	function ajaxCallFailed(error) {
   		
        $.mobile.hidePageLoadingMsg();
        toast('Check In Failed');
	}
}

var BacktoPage = function() {
    history.back();  
}

var checkOut = function() {
	
	var uuid = localStorage.getItem('uuid');	
	var Barcode = localStorage.getItem('barcode');
	var Location = localStorage.getItem('latitude') + "," + localStorage.getItem('longitude');
    var Action_checkout = 2;
    var now = new Date();
	var d = now.getTime();
    localStorage.setItem('rest-checkin', 'false'); //REST NAME WILL NOT APEAR NOW
    
    try 
    {
    	$.mobile.loadingMessageTextVisible=true;
        $.mobile.loadingMessage = "Checking Out...";
        $.mobile.showPageLoadingMsg();
        
        $.ajax({
               type: "POST",
               url: "http://peaceful-escarpment-2232.herokuapp.com/services/multidine/CreateEntry",
               data: JSON.stringify({"UDId": uuid, "Data": Barcode, "Location": Location,"TimeofCheckIn": d , "ActionTypeId": 2}),    
               contentType: "application/json",
               dataType: "json",
               success: ajaxcheckoutSucceed,
               failure: ajaxcheckoutFailed
               });
        
        $.mobile.hidePageLoadingMsg();
        
        localStorage.setItem('rest-checkin', 'false'); //REST NAME WILL NOT APEAR NOW
        $('.geolocation').css('color', 'black');
        $('.navButton3').attr('src', 'images/V2/Home/CheckIn.png');
        $('.checkBtn').attr("href", "#page-checkin");
        $('.restBtn').attr("href", "#page-rest");
        $('.navButton3').attr("onClick", "clickScan();");
        $.mobile.changePage( "#page-home", { transition: "none"} );
        navigator.geolocation.watchPosition(onSuccess, onError, options);
        
        return true;  
        
    }
    catch (e) 
    {
        //toast(e.toString());
        console.log(e.toString());
        return false;
	}	
	
	function ajaxcheckoutSucceed(response) 
	{             
  		console.log(response);
	}
    
	function ajaxcheckoutFailed(error) {
   		console.log(error);
	}
}

var fblogin = function() {
	
	function updateButton(response) {
	//alert("1");
	if (response.authResponse) {
      //user is already logged in and connected
      alert("Logged");
    }
    }
    
    FB.getLoginStatus(updateButton);
	
    localStorage.setItem('fbuser', "");
    try {
    FB.login(
        function(response) {

             if (response.authResponse.session_key) {
                var accessToken = response.authResponse.accessToken;
                localStorage.setItem('fbaccessToken', accessToken);
             
                FB.api('/me', function(me){
                    if (me.name) {
                       
                       localStorage.setItem('fbuser', me.name);
                       localStorage.setItem('fbID', me.id);
                       
                       $.mobile.loadingMessageTextVisible=true;
                       $.mobile.loadingMessage = "Updating FB login...";
                       $.mobile.showPageLoadingMsg();
                       
                       fbUpdate();
                       
                       $.mobile.hidePageLoadingMsg();
                       
                       var check = localStorage.getItem('rest-checkin');
                       if( check == 'true'){
                       		displayFBResult();
                       }
                       
                       
                       $.mobile.changePage( "#page-home", { transition: "none"} );
                    }
                })
             } else {
                //alert(response.session);
                fbLogout();
             }
        },
        { scope: "email" }
    ); } catch (e) {
        	console.log(e);
        	alert(e);
       }
    
}

var change = function() {
	$.mobile.changePage( "#page-home", { transition: "none"} );
}

var fbUpdate = function() {
	
	var uuid = localStorage.getItem('uuid');	
	//var fbid = localStorage.getItem('fbuser');
	var fbid = localStorage.getItem('fbID');
	var fbaccToken = localStorage.getItem('fbaccessToken');
    
	try 
    {
        
        $.ajax({
               type: "POST",
               url: "http://peaceful-escarpment-2232.herokuapp.com/services/multidine/FBUpdate",
               data: JSON.stringify({"UDId": uuid, "FBId": fbid, "FBAccessToken": fbaccToken}),    
               contentType: "application/json",
               dataType: "json",
               success: ajaxSucceed,
               failure: ajaxFailed
               });
        
        
        $.mobile.changePage( "#page-home", { transition: "none"} );
    }
    catch (e) 
    {
        toast(e.toString());
        return false;
	}	
	
	function ajaxSucceed(response) 
	{             
  		$.mobile.hidePageLoadingMsg();
        //alert('FB update success');
        //alert(JSON.stringify(response));
	}
    
	function ajaxFailed(error) {
   		$.mobile.hidePageLoadingMsg();
        toast('FB update to server failed');
	}
}

var processResult = function() {
    
    var logged = false;
    var fb_logged = true;
    var md_logged = true;
    
    
    if (localStorage.getItem('fbuser') == null || localStorage.getItem('fbuser').toString().length == 0 ){ // || localStorage.getItem('rest-checkin').toString() == 'false') {
        fb_logged = false;
    }
    if (localStorage.getItem('multiuser') == null || localStorage.getItem('multiuser').toString().length == 0) {
        md_logged = false;
    }
    
    if (fb_logged == true || md_logged == true) {
        logged = true;
    }
    
    checkIn();
    
    if (logged == false){
    
        displayInitialResult();
    }
    else if (fb_logged == true) {
        //displayFBResult();
        localStorage.setItem('rest-checkin', 'true');
        $('.geolocation').html('Welcome to '+localStorage.getItem('restaurantName'));
        $('.geolocation').css('color', 'darkred');
        $('.navButton3').attr('src', 'images/V2/Home/CheckOut.png');
        //$('.checkBtn').attr("href", "#page-fbresult");
        $('.checkBtn').attr("href", "#page-home");
        $('.restBtn').attr("href", "#page-rest2");
        $('.navButton3').attr("onClick", "checkOut();");
        //displayFBResult();
        
        //remmember checkin
        $('#rest-homepost').html('');
        restHomepage("2");
        $.mobile.changePage( "#page-rest2", { transition: "none"} );
        	
        
    }
    else if (md_logged == true) {
        displayMultiResult();
    }

}

var displayInitialResult = function() {
    
    var fblogeduser = localStorage.getItem('fbuser');
    var rest_name = localStorage.getItem('restaurantName');
    var table_no = localStorage.getItem('tableNumber');
    var seat_no = localStorage.getItem('seatNumber');
    
    
    $('#mainresult').html("");
    html = '';
    
    html = '<p style="font-family: times, serif; font-size:14pt;">Welcome to ' + rest_name.toString() + '</p>';
    html = html + '<p style="font-family: times, serif; font-size:14pt;">You are seated at:</p>';
    
    html = html + '<p style ="font-family: times, serif; font-size:14pt;">Table ' + parseInt(table_no.toString()) +' Seat '+ parseInt(seat_no.toString()) + '</p>';
    
    $.mobile.changePage( "#page-login", { transition: "none"} );
    
    $('#mainresult').append(html);
}

var displayFBResult = function() {
    
    var fblogeduser = localStorage.getItem('fbuser');
    var rest_name = localStorage.getItem('restaurantName');
    var table_no = localStorage.getItem('tableNumber');
    var seat_no = localStorage.getItem('seatNumber');
    
    $('#geolocation7').html('Welcome to '+localStorage.getItem('restaurantName'));
    
    $("#fbresult").html("");
    html = '';
    html = html + '<br><p style="clear:both; font-family: times, serif; font-size:16pt; color:blue;">Hi, ' + fblogeduser + ', </p>';
    html = html + '<p style="font-family: times, serif; font-size:14pt;">Welcome to ' + rest_name.toString() + '</p>';
    html = html + '<p style="font-family: times, serif; font-size:14pt;">You are seated at:</p>';
    
    html = html + '<p style ="font-family: times, serif; font-size:14pt;">Table ' + parseInt(table_no.toString()) +'     Seat '+ parseInt(seat_no.toString()) + '</p>';                       
    
    $.mobile.changePage( "#page-fbresult", { transition: "none"} );
    
    $('#fbresult').append(html); 
}


var displayMultiResult = function() {
    
    var loggedmduser = localStorage.getItem('multiuser');
    var rest_name = localStorage.getItem('restaurantName');
    var table_no = localStorage.getItem('tableNumber');
    var seat_no = localStorage.getItem('seatNumber');

	$("#restName").html("");    
    html = '';
    html = html + 'Welcome to ' + rest_name.toString(); 
    $('#restName').append(html);
    
    $("#mdresult2").html("");
    html = '';
    //html = html + '<br><p style="clear:both; font-family: ariel; font-size:20pt; color:blue;">Hi,' + loggedmduser + ', </p>';
    html = html + '<p style="font-family: times, serif; font-size:14pt;">Welcome to ' + rest_name.toString() + '</p>';
    //html = html + '<p style="font-family: times, serif; font-size:14pt;">You are seated at:</p>';
    //html = html + '<p style ="font-family: times, serif; font-size:14pt;">Table ' + parseInt(table_no.toString()) +'     Seat '+ parseInt(seat_no.toString()) + '</p>';
    
    $.mobile.changePage( "#page-multresult", { transition: "none"} );
    
    $('#mdresult2').append(html);
}


var fbLogout = function() {
    FB.logout(function(response){
              
        localStorage.setItem('fbuser', "");
              
        displayInitialResult();
    });
}

var multidineLogout = function() {
    localStorage.setItem('multiuser', "");
    
    displayInitialResult();
    
    
}

var changeSeat = function() {

    CheckoutforSeatChange();
}

function CheckoutforSeatChange() {
    

	var uuid = localStorage.getItem('uuid');	
	var Barcode = localStorage.getItem('barcode');
	var Location = localStorage.getItem('latitude') + "," + localStorage.getItem('longitude');
    var Action_checkout = 2;
    
    try 
    {
        $.mobile.loadingMessageTextVisible=true;
        $.mobile.loadingMessage = "Updating Seat Change...";
        $.mobile.showPageLoadingMsg();
        
        
    	$.ajax({
               type: "POST",
               url: "http://peaceful-escarpment-2232.herokuapp.com/services/multidine/CreateEntry",
               data: JSON.stringify({"UDId": uuid, "Data": Barcode, "Location": Location,"TimeofCheckIn": '10-10-10', "ActionTypeId": 2}),    
               contentType: "application/json",
               dataType: "json",
               success: ajaxcheckoutSucceed,
               failure: ajaxcheckoutFailed
               });
        
        $.mobile.hidePageLoadingMsg();
        
        $.mobile.changePage( "#page-home", { transition: "none"} );
        
        return true;  
        
    }
    catch (e) 
    {
        $.mobile.hidePageLoadingMsg();
        toast(e.toString());
        
        return false;
	}	
	
	function ajaxcheckoutSucceed(response) 
	{             
  		$.mobile.hidePageLoadingMsg();
	}
    
	function ajaxcheckoutFailed(error) {
   		
        $.mobile.hidePageLoadingMsg();
        toast('Check out Failed');
	}

}


//----//

var fuzzyFacebookTime = (function(){
	fuzzyTime.defaultOptions={
		// time display options
		relativeTime : 48,
		// language options
		monthNames : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], amPm : ['AM', 'PM'],
		ordinalSuffix : function(n) {return ['th','st','nd','rd'][n<4 || (n>20 && n % 10<4) ? n % 10 : 0]}
	}
	
	function fuzzyTime (timeValue, options) {
		var options=options||fuzzyTime.defaultOptions, 
		date=parseDate(timeValue),
		delta=parseInt(((new Date()).getTime()-date.getTime())/1000),
		relative=options.relativeTime,
		cutoff=+relative===relative ? relative*60*60 : Infinity;
		
		if (relative===false || delta>cutoff)
			return formatTime(date, options)+' '+formatDate(date, options);
		
		if (delta<60) return 'less than a minute ago';
		var minutes=parseInt(delta/60 +0.5);
		if (minutes <= 1) return 'about a minute ago';
		var hours=parseInt(minutes/60 +0.5);
		if (hours<1) return minutes+' minutes ago';
		if (hours==1) return 'about an hour ago';
		var days=parseInt(hours/24 +0.5);
		if (days<1) return hours+' hours ago';
		if (days==1) return formatTime(date, options)+' yesterday';
		var weeks=parseInt(days/7 +0.5);
		if (weeks<2) return formatTime(date, options)+' '+days+' days ago';
		var months=parseInt(weeks/4.34812141 +0.5);
		if (months<2) return weeks+' weeks ago';
		var years=parseInt(months/12 +0.5);
		if (years<2) return months+' months ago';
			return years+' years ago';
	}
	
	function parseDate (str) {
		var v=str.replace(/[T\+]/g,' ').split(' ');
		return new Date(Date.parse(v[0] + " " + v[1] + " UTC"));
	}
	
	function formatTime (date, options) {
		var h=date.getHours(), m=''+date.getMinutes(), am=options.amPm;
		return (h>12 ? h-12 : h)+':'+(m.length==1 ? '0' : '' )+m+' '+(h<12 ? am[0] : am[1]);
	}
	
	function formatDate (date, options) {
		var mon=options.monthNames[date.getMonth()],
		day=date.getDate(),
		year=date.getFullYear(),
		thisyear=(new Date()).getFullYear(),
		suf=options.ordinalSuffix(day);
		return mon+' '+day+suf+(thisyear!=year ? ', '+year : '');
	}
	
	return fuzzyTime;
}());




