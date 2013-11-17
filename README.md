# Topic Timeline

This timeline shows representative New York Times stories for a chosen keyword using data from the New York Times' Article Search API.

Topic Timeline requries AngularJS and TimelineJS.

## Demo

See a demo at 
[http://chc.name/dev/topic-timeline](http://chc.name/dev/topic-timeline)

## Installation

Include AngularJS, TimelineJS, and `topic-timeline.js` in your HTML file,
in that order. 

Now add a `<topic-timeline>` element to your HTML, setting the `search-term` and
`api-key` attributes:

    <topic-timeline search-term="food" api-key="YOUR_NYT_API_KEY_HERE" />

See `example.html` for an example.
