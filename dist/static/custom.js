(()=>{

Wiklo.title = 'Wiklo Docs'

Wiklo.home = `

Wiklo is a simple [[https://en.wikipedia.org/wiki/Static_site_generator|Static Site Generator]] and a [[https://en.wikipedia.org/wiki/Single-page_application|Single-page Application]].

To edit this page, find <code>/dist/static/custom.js</code> and edit <code>Wiklo.home</code>.
<!--
It is adviced you do not want to edit files other than base.html, custom.js, custom.css and logo.svg.

It is very likely that you can get your desired results from custom.js and css so unless you are sure you have to please do not edit files as they can be updated anytime.
-->
{{articlelist|sortedby=creation}}
`

window.addEventListener('load', ()=>{
    document.querySelector('.header-logo > img').style.transition = 'transform 604800s linear' // 1 week 'linear' or 'steps(604800, jump-end)'
    document.querySelector('.header-logo > img').style.transform = 'rotate(3628800deg)' // 1 rpm (1 week * 360 / 60 deg)
})

Wiklo.moduleHandlers = {...Wiklo.moduleHandlers, ...{
    // Custom templates/modules here
}}

})()