# video

Custom **video** block. Purpose: embedded Brightcove or YouTube video in article bodies
(source `section.articleMedia.articleMedia-video` with a Brightcove `div.video-js`, or a YouTube iframe).

Rendered as a responsive 16:9 player: `<div class="video-player"><iframe …></iframe></div>`.
The iframe is only created when the block scrolls within 200px of the viewport (IntersectionObserver).
When a poster image is authored, the poster is shown with a play button and the iframe
(with autoplay) is created on click. YouTube always uses the privacy-enhanced
`www.youtube-nocookie.com/embed/{id}` URL. Unsupported URLs render as a plain link; an
empty or non-http(s) value renders nothing.

## Authoring

Model: `video`. Three rows, one cell each:

1. **Video URL** (`link`, text, required). Accepted forms:
   - Brightcove: `https://players.brightcove.net/{account}/{player}_{embed}/index.html?videoId={id}`
   - YouTube: `https://www.youtube.com/watch?v={id}`, `https://youtu.be/{id}`, `https://www.youtube.com/embed/{id}` (also `/shorts/{id}`)
2. **Title** (`title`, text, optional): becomes the iframe `title` (accessible name) and the play button label. Defaults to "Video player".
3. **Poster** (`poster`, image reference, optional), alt text in `posterAlt`. Optional; leave empty to lazy-load the player directly.

The block finds the poster row by its picture and the link row by its URL, so an empty title or poster row is tolerated.

## Supported variations

No variations.

## Universal Editor fields

| Field | Component | Cell |
| --- | --- | --- |
| `link` | text | row 1 |
| `title` | text | row 2 |
| `poster` | reference | row 3 |
| `posterAlt` | text (collapsed into `poster` as the img `alt`) | row 3 |

## Expected block HTML (importer parser contract)

The importer parser should emit this table (xwalk field hints as comments; `posterAlt`
is the `alt` of the img and needs no hint of its own):

```html
<table>
  <tr><th>Video</th></tr>
  <tr><td><!-- field:link --><a href="https://players.brightcove.net/6415937670001/default_default/index.html?videoId=6371228231112">https://players.brightcove.net/6415937670001/default_default/index.html?videoId=6371228231112</a></td></tr>
  <tr><td><!-- field:title -->GEP video project</td></tr>
  <tr><td><!-- field:poster --></td></tr>
</table>
```

- Header cell: `Video` (no variants).
- Row 1 (`link`): build the URL from the Brightcove `div.video-js` attributes:
  `https://players.brightcove.net/${data-account}/${data-player || 'default'}_${data-embed || 'default'}/index.html?videoId=${data-video-id}`.
  For YouTube iframes, convert `…/embed/{id}` to `https://www.youtube.com/watch?v={id}`. A plain-text URL or an `<a>` are both accepted by the block.
- Row 2 (`title`): the text of `.vjs-title-bar-title` (Brightcove) or the iframe `title` (YouTube); empty `<td>` with its hint when absent.
- Row 3 (`poster`): keep the row with an empty `<td>` and its hint. Do not import the source poster (short-lived signed URLs).
- One block per video. A heading preceding the video (e.g. the H2s on the CNG series page) stays default content before the block.

Delivered markup (what `decorate` receives):

```html
<div class="video">
  <div><div><p><a href="https://players.brightcove.net/6415937670001/default_default/index.html?videoId=6371228231112">https://players.brightcove.net/…</a></p></div></div>
  <div><div><p>GEP video project</p></div></div>
  <div><div></div></div>
</div>
```

Decorated output (no poster):

```html
<div class="video" data-provider="brightcove">
  <div class="video-player">
    <iframe src="https://players.brightcove.net/6415937670001/default_default/index.html?videoId=6371228231112"
      title="GEP video project" loading="lazy"
      allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe>
  </div>
</div>
```
