var is_nwjs = (typeof nw != 'undefined');
var is_nwjsdev = is_nwjs && (window.navigator.plugins.namedItem('Native Client') !== null);
function empty(o) {
    return o==null || o==undefined || o==0 || o.length==0;
}
var ntf_win = null; // 通知窗口
var lst_win = null; // 列表窗口
if(!empty($)) {
    if (is_nwjsdev)
        nw.Window.get().showDevTools();
    $(document).ready(function(){
        if($('#gtitle_div').size()==0)    // 确保当前处于monitor页面
            return;
        console.log('加载notify.html和list.html');
        nw.Window.open('notify.html',{"show":false}, function(new_win){ntf_win=new_win;});
        nw.Window.open('list.html',{"show":false}, function(new_win){
            lst_win=new_win;
            lst_win.on('loaded', function() {
                lst_win.window.setOpener(nw.Window.get());});
            });
    });
}
function adjustJSON(t){
    var lines = t.split("\n");
    var ret = '';
    for(var i=0; i<lines.length; ++i) {
        var idx = lines[i].indexOf(':');
        if (idx<1) {
            ret += lines[i]+'\n';
        } else {
            ret += '"'+lines[i].substr(0,idx).trim()+'"'+lines[i].substring(idx)+'\n';
        }
    }
    return ret;
}
function loadAlert() {
    $.ajax({
        url:'/alert', 
        cache:false, 
        dataType:'text',
        async: true,
        method: "POST",
        data: {
            action:"myalert",
            "alertrecordbean.keywords":"",
            "alertrecordbean.mixids":"",
            "alertrecordbean.my":true,
            limit:100,
            moduleid:1
        },
        success:function(t){
            // 报警后台返回的json的key都缺少双引号，使用正则处理加上双引号后才能正常解析
            t = adjustJSON(t);
            var data = JSON.parse(t);
            if (!empty(data)) {
                lst_win.window.updateAlertList(data.data);
            }
        },
        error:function(){
            console.log('加载报警数据出错');
        }
    });
}
function desktopNotify(rec) {
    console.log('桌面通知: '+rec.alertmsg);
    ntf_win.window.notify(rec.mixname, rec.alertmsg);
}