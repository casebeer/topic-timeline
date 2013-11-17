
all: timeline.html

timeline.html: example.html
	sed -e s/\<ENTER_API_KEY_HERE\>/$(APIKEY)/ $^ > $@

clean: /dev/null
	rm -f timeline.html
