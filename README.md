# Topic Timeline

Topic Timeline requries AngularJS and TimelineJS.

## Installation

Build the `topic-timeline.js` file with `make`:

    $ make 

Include AngularJS, TimelineJS, and `topic-timeline.js` in your HTML file,
in that order. 

Now add a `<topic-timeline>` element to your HTML, setting the `search-term` and
`api-key` attributes:

    <topic-timeline search-term="food" api-key="YOUR_NYT_API_KEY_HERE" />

See `example.html` for an example.
