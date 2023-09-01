    function d() {
        document.querySelector("html").classList.contains("is-builder") || document.querySelectorAll(".mbr-popup[data-on-timer-delay]").forEach(function(b) {
            var c = b.getAttribute("data-on-timer-delay"), a;
            a.show()
        })
    }
    function poll() {
        console.log('poll');
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '127.0.0.1/poll.php', true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                if (xhr.responseText == 'winner_selected') {
                    console.log('found');
                    d();
                    return;
                }
                poll();
            }
        }
        xhr.send();
    }
    poll()
    console.log('here')