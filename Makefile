
all: timeline.html topic-timeline.js

topic-timeline.js: src/topic-timeline-ng.js src/nyt-api.js
	cat $^ > $@

timeline.html: example.html
	sed -e s/\<ENTER_API_KEY_HERE\>/$(APIKEY)/ $^ > $@

clean: /dev/null
	rm -f timeline.html
