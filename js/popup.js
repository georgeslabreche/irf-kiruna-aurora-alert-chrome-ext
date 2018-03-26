$(document).ready(function() {
    // Register checkbox listener.
    $('#notification-cb').on('change', function(e) {
        chrome.storage.sync.set({
            'notification': ($(this).is(":checked"))
        }, function() {});
    })

    // Set default notification. Depends on content of storage.
    chrome.storage.sync.get('notification', function(storage) {
        if(storage == null){
            $('#notification-cb').prop("checked", true);
            chrome.storage.sync.set({'notification': true}, function() {});

        }else{
            $('#notification-cb').prop('checked', (storage.notification == true));
        }
    });    
});