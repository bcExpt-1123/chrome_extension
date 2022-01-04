

_clicktocall_useUs = true;
_clicktocall_customRegex = "not_set";
_clicktocall_protocol = "tel";

chrome.storage.sync.get({
    useUs: true,
    customRegex: '',
    prot: 'tel'
}, function (items) {
    _clicktocall_useUs = items.useUs;
    _clicktocall_customRegex = items.customRegex;
    _clicktocall_protocol = items.prot;

    start();
});
var phonearry = [];
var i = 0;
var listener = "http://localhost:60024/";

function start() {
    phonify(document.body);

    var mutationObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === "childList")
                for (var i = mutation.addedNodes.length - 1; i >= 0; i--) {
                    var cnode = mutation.addedNodes[i];

                    if (cnode.className !== "clicktocall")
                        phonify(cnode);
                }
        });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });
}

var handleText = function (node) {

    var regex = _clicktocall_useUs ? /(\+?(00)?1)?-? *\(?\d{3}\)?-? *\d{3}-? *-?\d{4}/ig : new RegExp(_clicktocall_customRegex, "ig");
    if (regex.test(node.nodeValue)) {
        phonearry.push(node.nodeValue);
        console.log(phonearry.length);
        var replacementNode = document.createElement('span');
        replacementNode.className = "clicktocall";
        // onClick='window.onbeforeunload = null; event.stopPropagation();'
        replacementNode.innerHTML = node.nodeValue.replace(regex,
            "$& <a class='clicktocall' style='cursor: pointer' id='phoneicon" + i + "' href='http://localhost:60024/demo/ajax?redirect_url=" + location.href + "&phone=$&' phonenumber='"
            + _clicktocall_protocol
            + ":$&'><img border='0' class='clicktocall' src='"
            + chrome.runtime.getURL("img/icon16.png")
            + "' ></img></a>");

        if (node.parentNode.className !== "clicktocall") {
            node.parentNode.insertBefore(replacementNode, node);
            node.parentNode.removeChild(node);
        }

        var iconclick = document.getElementById(`phoneicon${i}`);
        if (iconclick != null) {
            iconclick.addEventListener("click", senddata, false);

        }
    }
    i += 1;

};




function senddata(event) {
    event.preventDefault();                     // Don't navigate!
    location.href = $(this).attr("href");
    $.ajax({
        url: listener + "demo/ajax",
        dataType: "jsonp",
        cache: false,
        type: "GET",
        cors: true,
        contentType: 'application/json',
        secure: true,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        data: {
            number: 5
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(""));
        },
        success: function (data, status) {
            alert(data);
        },
        error: function (request, error) {
            console.log(error);
            if (error) {
                let curenturl = document.location.host;
                location.reload(curenturl);
                let permission = Notification.permission;
                if (permission === "granted") {
                    showNotification();
                } else if (permission === "default") {
                    requestAndShowPermission();
                } else {
                    alert("Use normal alert");
                }
            }
        },
    });



}
function showNotification() {
    var title = "Please install Foxtel app";
    var icon = chrome.runtime.getURL("img/icon16.png");
    var body = "Message to be displayed";
    var notification = new Notification(title, { body, icon });
    notification.onclick = () => {
        notification.close();
        window.parent.focus();
    }
    setTimeout(() => {
        notification.close();
        window.parent.focus();
    }, 4500);
}
function requestAndShowPermission() {

    Notification.requestPermission(function (permission) {
        if (permission === "granted") {
            showNotification();
        }
    });
}

var walk = function (node) {
    if (node.nodeType === 3) {
        handleText(node);
        return;
    }

    Array.prototype.forEach.call(
        node.childNodes,
        (childNode) => {
            const { tagName } = childNode;
            if (tagName !== 'SCRIPT' && tagName !== 'NOSCRIPT' && tagName !== 'STYLE') {
                walk(childNode);
            }
        }
    );
};

var phonify = function (node) {

    if (node.nodeType !== 1)
        return;

    walk(node);
};
