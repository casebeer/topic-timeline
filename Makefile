
all: timeline.html topic-timeline.js

docs: README.html

README.html: README.md
	pandoc $^ > $@

topic-timeline.js: src/nyt-api.js src/topic-timeline-ng.js 
	cat $^ > $@

timeline.html: example.html
	sed -e s/ENTER_API_KEY_HERE/$(APIKEY)/ $^ > $@

clean: /dev/null
	rm -f timeline.html topic-timeline.js README.html
