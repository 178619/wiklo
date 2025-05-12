(()=>{

const toOtherDocument = (p, s, args, kwargs) => {
    args[0] = args[0] || `${Wiklo.PAGENAME} (disambiguation)`
    let t = ''
    for (let i=0;i<args.length;i++) {
        if (i != 0 && args.length-1 == i) t += ' and '
        if (i != 0 && args.length-1 != i) t += ', '
        t += `[[${args[i]}|${kwargs['l'+(i+1)] || args[i].replace('#', ' &#xA7; ')}]]`
    }
    return hatnote(p + t + s, kwargs)
}

const toOtherDocumentMulti = (p, s, args, kwargs) => {
    args[1] = args[1] || `${Wiklo.PAGENAME} (disambiguation)`
    if (args[2] && !args[3]) args[3] = `${Wiklo.PAGENAME} (disambiguation)`
    if (args[4] && !args[5]) args[5] = `${Wiklo.PAGENAME} (disambiguation)`
    if (args[6] && !args[7]) args[7] = `${Wiklo.PAGENAME} (disambiguation)`
    let t = `For ${args[0] || 'other uses'}, see [[${args[1]}]]`
    if (args[3]) {
        if (args[2] == 'and') t += `${args[4] == 'and' ? ',' : ' and'} [[${args[3]}]]`
        else t += `. For ${args[2] || 'other uses'}, see [[${args[3]}]]`
    }
    if (args[5]) {
        if (args[4] == 'and') t += `${args[6] == 'and' ? ',' : ', and'} [[${args[5]}]]`
        else t += `. For ${args[4] || 'other uses'}, see [[${args[5]}]]`
    }
    if (args[7]) {
        if (args[6] == 'and') t += `, and [[${args[7]}]]`
        else t += `. For ${args[6] || 'other uses'}, see [[${args[7]}]]`
    }
    if (!args[args.length-1].endsWith('.')) t += '.'
    return hatnote(p + t + s, kwargs)
}

const getCiteAuthors = (kwargs) => {
    kwargs.first = kwargs.first1 || kwargs.given1 || kwargs.first || kwargs.given
    kwargs.last = kwargs.last1 || kwargs.surname1 || kwargs.last || kwargs.surname
    kwargs.author = kwargs.author1 || kwargs.author
    kwargs['author-link'] = kwargs['author-link1'] || kwargs['author-link']
    let t = `${kwargs['author-link'] ? '<a href="./?'+kwargs['author-link']+'" title="'+kwargs['author-link']+'">' : ''}${kwargs.author || ''}${kwargs.last ? kwargs.last+(kwargs.first ? '' : ' ') : ''}${kwargs.first ? ((kwargs.last || kwargs.author) ? ', ' : '')+kwargs.first : ''}${kwargs['author-link'] ? '</a>' : ''}`
    for (let i=2; i<255; i++) {
        kwargs['first'+i] = kwargs['first'+i] || kwargs['given'+i]
        kwargs['last'+i] = kwargs['last'+i] || kwargs['surname'+i]
        if (!(kwargs['first'+i] || kwargs['last'+i] || kwargs['author'+i])) break
        kwargs['author-link'+i] = kwargs['author-link'+i] || kwargs['author'+i+'-link']
        t += `; ${kwargs['author-link'+i] ? '<a href="./?'+kwargs['author-link'+i]+'" title="'+kwargs['author-link'+i]+'">' : ''}${kwargs['author'+i] || ''}${kwargs['last'+i] ? kwargs['last'+i]+(kwargs['first'+i] ? '' : ' ') : ''}${kwargs['first'+i] ? ((kwargs['last'+i] || kwargs['author'+i]) ? ', ' : '')+kwargs['first'+i] : ''}${kwargs['author-link'+i] ? '</a>' : ''}`
    }
    return t
}
const hatnote = (text, kwargs) => `<div class="hatnote${kwargs.extraclasses ? (' ' + kwargs.extraclasses) : ''}">${text}</div>`
const mediawiki = {
    'pagename': () => Wiklo.PAGENAME || '',
    'sitename': () => Wiklo.title || '',
    'server': () => '//' + window.location.hostname,
    'servername': () => window.location.hostname,
    'articlepath': () => window.location.pathname + '?$1',
    'currentyear': () => new Date().getUTCFullYear()+'',
    'currentmonth': () => (new Date().getUTCMonth()+1+'').padStart(2, '0'),
    'currentday': () => new Date().getUTCDate()+'',
    'currentday2': () => (new Date().getUTCDate()+'').padStart(2, '0'),
    'currentdow': () => new Date().getUTCDay()+'',
    'currentdayname': () => new Date().toLocaleDateString(undefined, {weekday: 'long', timeZone: 'UTC'}),
    'currenttime': () => (new Date().getUTCHours()+'').padStart(2, '0')+':'+(new Date().getUTCMinutes()+'').padStart(2, '0'),
    'currenthour': () => (new Date().getUTCHours()+'').padStart(2, '0'),
    'currenttimestamp': () => ''+new Date().getUTCFullYear()+(new Date().getUTCMonth()+1+'').padStart(2, '0')+(new Date().getUTCDate()+'').padStart(2, '0')+(new Date().getUTCHours()+'').padStart(2, '0')+(new Date().getUTCMinutes()+'').padStart(2, '0')+(new Date().getUTCSeconds()+'').padStart(2, '0'),
    'localyear': () => new Date().getFullYear()+'',
    'localmonth': () => (new Date().getMonth()+1+'').padStart(2, '0'),
    'localday': () => new Date().getDate()+'',
    'localday2': () => (new Date().getDate()+'').padStart(2, '0'),
    'localdow': () => new Date().getDay()+'',
    'localdayname': () => new Date().toLocaleDateString(undefined, {weekday: 'long'}),
    'localtime': () => (new Date().getHours()+'').padStart(2, '0')+':'+(new Date().getUTCMinutes()+'').padStart(2, '0'),
    'localhour': () => (new Date().getHours()+'').padStart(2, '0'),
    'localtimestamp': () => ''+new Date().getFullYear()+(new Date().getMonth()+1+'').padStart(2, '0')+(new Date().getDate()+'').padStart(2, '0')+(new Date().getHours()+'').padStart(2, '0')+(new Date().getMinutes()+'').padStart(2, '0')+(new Date().getSeconds()+'').padStart(2, '0'),
    'revisionyear': () => new Date(Wiklo.PAGEINFO?.lastModification || 0).getFullYear()+'',
    'revisionmonth': () => (new Date(Wiklo.PAGEINFO?.lastModification || 0).getMonth()+1+'').padStart(2, '0'),
    'revisionday': () => new Date(Wiklo.PAGEINFO?.lastModification || 0).getDate()+'',
    'revisionday2': () => (new Date(Wiklo.PAGEINFO?.lastModification || 0).getDate()+'').padStart(2, '0'),
    'revisiondow': () => new Date(Wiklo.PAGEINFO?.lastModification || 0).getDay()+'',
    'revisiondayname': () => new Date(Wiklo.PAGEINFO?.lastModification || 0).toLocaleDateString(undefined, {weekday: 'long'}),
    'revisiontime': () => (new Date(Wiklo.PAGEINFO?.lastModification || 0).getHours()+'').padStart(2, '0')+':'+(new Date(Wiklo.PAGEINFO?.lastModification || 0).getMinutes()+'').padStart(2, '0'),
    'revisionhour': () => (new Date(Wiklo.PAGEINFO?.lastModification || 0).getHours()+'').padStart(2, '0'),
    'revisiontimestamp': () => ''+new Date(Wiklo.PAGEINFO?.lastModification || 0).getFullYear()+(new Date(Wiklo.PAGEINFO?.lastModification || 0).getMonth()+1+'').padStart(2, '0')+(new Date(Wiklo.PAGEINFO?.lastModification || 0).getDate()+'').padStart(2, '0')+(new Date(Wiklo.PAGEINFO?.lastModification || 0).getHours()+'').padStart(2, '0')+(new Date(Wiklo.PAGEINFO?.lastModification || 0).getMinutes()+'').padStart(2, '0')+(new Date(Wiklo.PAGEINFO?.lastModification || 0).getSeconds()+'').padStart(2, '0'),
    'revisionuser': () => Wiklo.PAGEINFO?.author || '',
    'numberofpages': () => Object.values(Wiklo.getMetadataUnsafe()).filter(v=>!v.revised).length+'',
    'numberofarticles': () => Object.values(Wiklo.getMetadataUnsafe()).filter(v=>!v.revised&&v.MIMEType=='text/wkl').length+'',
    'numberoffiles': () => Object.values(Wiklo.getMetadataUnsafe()).filter(v=>!v.revised&&v.MIMEType!='text/wkl').length+'',
    'numberofedits': () => Object.values(Wiklo.getMetadataUnsafe()).length+'',
    'pageid': () => Wiklo.PAGEUUID || '',
    '!': () => '&#x7C;',
    '=': () => '&#x3D;',
    '!!': () => '&#x7C;&#x7C;',
    '!(': () => '&#x5B;',
    '!)': () => '&#x5D;',
    '!((': () => '&#x5B;&#x5B;',
    '!))': () => '&#x5D;&#x5D;',
    '(': () => '&#x7B;',
    ')': () => '&#x7D;',
    '((': () => '&#x7B;&#x7B;',
    '))': () => '&#x7D;&#x7D;',
    '(((': () => '&#x7B;&#x7B;&#x7B;',
    ')))': () => '&#x7D;&#x7D;&#x7D;',
    '(!': () => '&#x7B;&#x7C;',
    '!+': () => '&#x7C;&#x2B;',
    '!-': () => '&#x7C;&#x2D;',
    '!)': () => '&#x7C;&#x7D;',
    '·': () => `&#xA0;<b>&#xB7;</b>`,
    '•': () => '&#xA0;&#x2022;',
    '\\': () => '&#xA0;&#x2F;',
    'ambox': (args, kwargs) => `<div style="margin:0 10%;border: 1px solid silver;border: 1px solid silver;border-left:8px solid silver;border-radius:4px 2px 2px 4px;background-color:whitesmoke;padding:2px 8px;">${kwargs.text}</div>`,
    'about': (args, kwargs) => toOtherDocumentMulti((args[0] ? `This ${Wiklo.getTrue(kwargs.section) ? 'section' : 'article'} is about ${args[0]}. ` : ''), '', args.slice(1), kwargs),
    'align': (args, kwargs) => {
        if (args[0] == 'center') return `<div style="width:100%;text-align:center;${kwargs.style || ''}">${args[1] || ''}</div>`
        if (args[0] == 'left' || args[0] == 'right') return `<div style="float:${args[0]};${kwargs.style || ''}">${args[1] || ''}</div>`
        return '<div>' + (args[1]||'') + '</div>'
    },
    'aligned table': (args, kwargs) => {
        // WIP
        let cols = kwargs.cols || 2
        let innerHTML = ''
        for (let i=0;i<args.length;i++) {
            if (i%cols == 0) innerHTML += '<tr>'
            innerHTML += '<td>'+args[i]+'</td>'
            if (i%cols-cols == -1) innerHTML += '</tr>'
        }
        return `<table><tbody>${innerHTML}</tbody></table>`
    },
    'annotated link': (args, kwargs) => '[['+args[0]+']]',
    'apod': (args, kwargs) => {
        const date = new Date(kwargs.date + ' UTC').toISOString()
        const link = 'https://apod.nasa.gov/apod/ap' + date.slice(2,4) + date.slice(5,7) + date.slice(8,10) + '.html'
        return `<a href="${link}">NASA Astronomy Picture of the Day: ${kwargs.title} (${kwargs.date})</a>`
    },
    'asterisk': () => '&#x2A;',
    'bots': () => '', // WIP
    'circa': (args, kwargs) => '<span style="white-space: nowrap;">' + (Wiklo.getTrue(kwargs.lk) ? '<a href="https://en.wiktionary.org/wiki/circa">c.</a>' : '<span title="circa">c.</span>') + (args[0] ? (' '+args[0]) : '') + (args[1] ? (' &#x2013; c. '+args[1]) : '') + '</span>',
    'citation needed': (args, kwargs) => '<sup style="white-space: nowrap;">[<i><span title="' + (kwargs.reason || 'This claim needs references to reliable sources.') + (kwargs.date ? (' (' + kwargs.date + ')') : '') + '">citation needed</span></i>]</sup>',
    'cite arxiv': (args, kwargs) => {
        let authors = getCiteAuthors(kwargs)
        kwargs.date = kwargs.date || kwargs.year
        kwargs.arxiv = kwargs.arxiv || kwargs.eprint
        return `<cite>${authors}${kwargs.date && authors ? ' ('+kwargs.date+')' : ''}${authors ? '. ' : ''}${kwargs.url ? '<a href="'+kwargs.url+'">' : ''}${kwargs.title ? '"'+kwargs.title+'"' : ''}${kwargs.url ? '</a>' : ''}.${kwargs.journal ? ' <i>'+kwargs.journal+'</i>.' : ''}${kwargs.arxiv ? ' arXiv:<a href="https://arxiv.org/abs/'+kwargs.arxiv+'">'+kwargs.arxiv+'</a>.' : ''}${kwargs.date && !authors ? ' '+kwargs.date+'.' : ''}</cite>`
    },
    'cite book': (args, kwargs) => {
        let authors = getCiteAuthors(kwargs)
        kwargs.date = kwargs.date || kwargs.year
        return `<cite>${authors}${kwargs.date && authors ? ' ('+kwargs.date+')' : ''}${authors ? '. ' : ''}${kwargs.url ? '<a href="'+kwargs.url+'">' : ''}${kwargs.title ? '<i>'+kwargs.title+'</i>' : ''}${kwargs.url ? '</a>' : ''}${kwargs.edition ? ' ('+kwargs.edition+' ed.)' : ''}.${kwargs.date && !authors ? ' '+kwargs.date+'.' : ''}${kwargs.publisher ? ' '+kwargs.publisher+'.' : ''}${kwargs.pages ? ' pp. '+kwargs.pages+'.' : ''}${kwargs.isbn ? ' ISBN '+kwargs.isbn+'.' : ''}${kwargs['access-date'] ? ' Retrieved '+kwargs['access-date']+'.' : ''}</cite>`
    },
    'cite journal': (args, kwargs) => {
        let authors = getCiteAuthors(kwargs) || kwargs.vauthors
        kwargs.date = kwargs.date || kwargs.year
        kwargs.arxiv = kwargs.arxiv || kwargs.eprint
        return `<cite>${authors}${kwargs.date && authors ? ' ('+kwargs.date+')' : ''}${authors ? '. ' : ''}${kwargs.url ? '<a href="'+kwargs.url+'">' : ''}${kwargs.title ? '"'+kwargs.title+'"' : ''}${kwargs.url ? '</a>' : ''}.${kwargs.journal ? ' <i>'+kwargs.journal+'</i>.' : ''}${kwargs.volume ? ' <b>'+kwargs.volume+'</b>'+(kwargs.issue ? ' ('+kwargs.issue+')' : '')+':' : ''}${kwargs.pages ? ' '+kwargs.pages+'.' : ''}${kwargs.arxiv ? ' arXiv:<a href="https://arxiv.org/abs/'+kwargs.arxiv+'">'+kwargs.arxiv+'</a>.' : ''}${kwargs.doi ? ' doi:<a href="https://doi.org/'+kwargs.doi+'">'+kwargs.doi+'</a>.' : ''}${kwargs.pmc ? ' PMC '+kwargs.pmc+'.' : ''}${kwargs.pmid ? ' PMID:'+kwargs.pmid+'.' : ''}${kwargs.date && !authors ? ' '+kwargs.date+'.' : ''}${kwargs['access-date'] ? ' Retrieved '+kwargs['access-date']+'.' : ''}</cite>`
    },
    'cite news': (args, kwargs) => {
        let authors = getCiteAuthors(kwargs)
        kwargs.date = kwargs.date || kwargs.year
        return `<cite>${authors}${kwargs.date && authors ? ' ('+kwargs.date+')' : ''}${authors ? '. ' : ''}${kwargs.url ? '<a href="'+kwargs.url+'">' : ''}${kwargs.title || ''}${kwargs.url ? '</a>' : ''}.${kwargs.website ? ' <i>'+kwargs.website+'</i>.' : ''}${kwargs.date && !authors ? ' '+kwargs.date+'.' : ''}${kwargs.publisher ? ' '+kwargs.publisher+'.' : ''}${kwargs['access-date'] ? ' Retrieved '+kwargs['access-date']+'.' : ''}</cite>`
    },
    'cite web': (args, kwargs) => {
        let authors = getCiteAuthors(kwargs)
        kwargs.date = kwargs.date || kwargs.year
        return `<cite>${authors}${kwargs.date && authors ? ' ('+kwargs.date+')' : ''}${authors ? '. ' : ''}${kwargs.url ? '<a href="'+kwargs.url+'">' : ''}${kwargs.title || ''}${kwargs.url ? '</a>' : ''}.${kwargs.website ? ' <i>'+kwargs.website+'</i>.' : ''}${kwargs.date && !authors ? ' '+kwargs.date+'.' : ''}${kwargs.publisher ? ' '+kwargs.publisher+'.' : ''}${kwargs['access-date'] ? ' Retrieved '+kwargs['access-date']+'.' : ''}</cite>`
    },
    'clear': (args, kwargs) => {
        if (args[0] == 'left') return '<div style="clear:left;"></div>'
        if (args[0] == 'right') return '<div style="clear:right;"></div>'
        return '<div style="clear:both;"></div>'
    },
    'div col': (args, kwargs) => '<div style="column-width:' + (kwargs.colwidth || '30em') + '">',
    'div col end': () => '</div>',
    'efn': () => '<sup>[REF]</sup>', // WIP
    'em dash': () => '&#x2014;',
    'en dash': () => '&#x2013;',
    'for': (args, kwargs) => toOtherDocument('For '+args[0]+', see ', '.', args.slice(1), kwargs),
    'for timeline': (args, kwargs) => toOtherDocument('For a chronological guide, see ', '.', [args[0] ? args[0] : ('Timeline of the '+Wiklo.PAGENAME), ...args.slice(1)], kwargs),
    'for-multi': (args, kwargs) => toOtherDocumentMulti('', '', args, kwargs),
    'further': (args, kwargs) => toOtherDocument('Further information'+(kwargs.topic ? ('on '+kwargs.topic) : '')+': ', '', args, kwargs),
    'hatnote': (args, kwargs) => hatnote(args[0], kwargs),
    'huge': (args, kwargs) => mediawiki.resize(['180%', ...args], kwargs),
    'infobox': (args, kwargs) => {
        //WIP
        const table = document.createElement('table')
        table.classList.add('infobox')
        table.style = kwargs.bodystyle
        if (kwargs.title) {
            const title = document.createElement('caption')
            title.innerHTML = kwargs.title
            table.appendChild(title)
        }
        const tbody = document.createElement('tbody')
        if (kwargs.above) {
            const above = document.createElement('th')
            above.colSpan = 2
            above.innerHTML = kwargs.above
            let row = document.createElement('tr')
            row.appendChild(above)
            tbody.appendChild(row)
        }
        if (kwargs.subheader) {
            const subheader = document.createElement('th')
            subheader.colSpan = 2
            subheader.innerHTML = kwargs.subheader
            let row = document.createElement('tr')
            row.appendChild(subheader)
            tbody.appendChild(row)
        }
        if (kwargs.subheader2) {
            const subheader2 = document.createElement('td')
            subheader2.colSpan = 2
            subheader2.innerHTML = kwargs.subheader2
            let row = document.createElement('tr')
            row.appendChild(subheader2)
            tbody.appendChild(row)
        }
        for (let i=1;i<255;i++) {
            if (kwargs['header'+i]) {
                let header = document.createElement('th')
                header.colSpan = 2
                header.innerHTML = kwargs['header'+i]
                let row = document.createElement('tr')
                row.appendChild(header)
                tbody.appendChild(row)
            } else if (kwargs['data'+i] && kwargs['label'+i]) {
                let label = document.createElement('th')
                label.innerHTML = kwargs['label'+i]
                let data = document.createElement('td')
                data.innerHTML = kwargs['data'+i]
                let row = document.createElement('tr')
                row.appendChild(label)
                row.appendChild(data)
                tbody.appendChild(row)
            } else if (kwargs['data'+i]) {
                let data = document.createElement('td')
                data.colSpan = 2
                data.innerHTML = kwargs['data'+i]
                let row = document.createElement('tr')
                row.appendChild(data)
                tbody.appendChild(row)
            }
        }
        table.appendChild(tbody)
        return table.outerHTML
    },
    'ipa': (args, kwargs) => args[1] ? `Pronunciation: [<span lang="${args[0]}">${args[1]}</span>]` : `<span title=Representation in the International Phonetic Alphabet (IPA)">${args[0]}</span>`, // WIP
    'lang': (args, kwargs) => `<span lang="${args[0]}">${args[1]}</span>`, // WIP
    'langx': (args, kwargs) => `${args[0]}: <span lang="${args[0]}">${args[1]}</span>`, // WIP
    'large': (args, kwargs) => mediawiki.resize(['120%', ...args], kwargs),
    'lua': (args, kwargs) => `<div style="border:1px solid black;float:right;clear:right;"><div>This template uses Lua:</div><ul>${args.map((v,i)=>`<li>[[${v}]]</li>`).join('')}</ul></div>`,
    'main': (args, kwargs) => toOtherDocument('Main article'+(args.length>1?'s':'')+': ', '', args, kwargs),
    'main list': (args, kwargs) => toOtherDocument('For a more comprehensive list, see ', '.', args, kwargs),
    'nobots': () => '', // WIP
    'not a typo': (args, kwargs) => args[0],
    'nowrap': (args, kwargs) => '<span style="white-space: nowrap;">'+args[0]+'</span>',
    'number sign': () => '&#x23;',
    'other uses': (args, kwargs) => {
        args[0] = args[0] || `${Wiklo.PAGENAME} (disambiguation)`
        let innerHTML = `For other uses, see [[${args[0]}]]`
        if (args[1]) innerHTML += `${args[2] ? ',' : ' and'} [[${args[1]}]]`
        for (let i=2;i<args.length;i++) innerHTML += `,${args[i+1] ? '' : ' and'} [[${args[i]}]]`
        innerHTML += '.'
        return innerHTML
    },
    'plainlist': (args, kwargs) => '<ul>'+(args[0] ? args[0].split('\n').map((v)=>{
        if (v.startsWith('* ')) return '<li>'+v.slice(2)+'</li>'
        return v
    }).join('') : '')+'</ul>',
    'redirect': (args, kwargs) => toOtherDocumentMulti('"'+args[0]+'" redirects here. ', '', args.slice(1), kwargs),
    'reflist': (args, kwargs) => '<div class="reflist"'+ (kwargs.group ? ' id="reflist-'+kwargs.group+'"' : '') +' style="column-width:' + (args[0] || '30em') + '"><ol></ol></div>',
    'replace': (args, kwargs) => {
        if (kwargs.count) {
            for (let i=0; i<parseInt(kwargs.count); i++) args[0] = args[0].replace(args[1], args[2])
            return args[0]
        }
        return args[0].replaceAll(args[1], args[2])
    },
    'resize': (args, kwargs) => {
        if (args.length < 2) {
            return '<span style="font-size:90%;">'+(args[0] || '')+'</span>'
        }
        return '<span style="font-size:'+args[0].replaceAll('"', '').split(';')[0]+';">'+(args[1] || '')+'</span>'
    },
    'see also': (args, kwargs) => toOtherDocument('See also: ', '', args, kwargs),
    'short description': () => '',
    'small': (args, kwargs) => mediawiki.resize(['85%', ...args], kwargs),
    'spaced en dash': () => '&#xA0;&#x2013;',
    'spaces': () => '&#xA0;', // WIP
    // 'template' templates WIP
    'template shortcut': (args, kwargs) => `<div style="border:1px solid black;${kwargs.float ? ('float:'+kwargs.float+';') : 'float:right;'}${kwargs.clear ? ('clear:'+kwargs.clear+';') : ''}"><div>Shortcut</div><ul>${args.map((v,i)=>`<li>&#x7B;&#x7B;${kwargs.pre || ''}${kwargs['pre'+(i+1)] || ''}[[${v}]]&#x7D;&#x7D;</li>`).join('')}</ul></div>`,
    'template journal inline': (args, kwargs) => `<code style="border:1px solid black;">&#x5B;&#x5B;[[${args[0]}]]${args.slice(1).map(v=>v?('&#x7C;'+'<span style="font-style:italic;color:#993333;">'+v+'</span>'):'').join('')}&#x5D;&#x5D;</code>`,
    'template link': (args, kwargs) => `&#x7B;&#x7B;[[${args[0]}]]&#x7D;&#x7D;`,
    'template link code': (args, kwargs) => mediawiki['template link general'](args, {...kwargs, code: true, nolink: true}),
    'template link expanded': (args, kwargs) => mediawiki['template link general'](args, {...kwargs, code: true}),
    'template link general': (args, kwargs) => `${Wiklo.getTrue(kwargs.code) ? '<code style="border:1px solid black;">' : ''}&#x7B;&#x7B;${Wiklo.getTrue(kwargs.nolink) ? args[0] : `[[${args[0]}]]`}${args.slice(1).map(v=>v?('&#x7C;'+v):'').join('')}&#x7D;&#x7D;${Wiklo.getTrue(kwargs.code) ? '</code>' : ''}`,
    'toc limit': (args, kwargs) => ``, // WIP
    'transliteration': (args, kwargs) => `<span lang="${args[0]}">${args[1]}</span>`, // WIP
    'use dmy dates': () => '',
    'val': (args, kwargs) => {
        let num = args[0]
        if (num === undefined) return ''
        num = num.replace(/[,\s]/g, '')
        let dec = ''
        let note = kwargs.e || 0
        if (num.includes('e')) [num, note] = num.split('e').slice(0, 2)
        if (note) note = ' × 10' + Wiklo.toSuper(note)
        if (num.includes('.')) [num, dec] = num.split('.').slice(0, 2)
        if (num == '') num = '0'
        switch (kwargs.fmt) {
            case 'gaps':
                num = num.replace(/(.)(?=(\d{3})+$)/g, '$1 ')
                break
            case 'commas':
                num = num.replace(/(.)(?=(\d{3})+$)/g, '$1,')
                break
            default:
                if (num.length < 5) break
                num = num.replace(/(.)(?=(\d{3})+$)/g, '$1 ')
                break
        }
        kwargs.u = kwargs.u || kwargs.ul
        kwargs.up = kwargs.up || kwargs.upl
        if (kwargs.u) kwargs.u = kwargs.u.replaceAll('.', '⋅')
        if (kwargs.up) kwargs.up = kwargs.up.replaceAll('.', '⋅')
        return '<span style="white-space:nowrap;">'+(kwargs.p||'')+num+(dec ? ('.' + dec) : '')+(args[1] ? ('±' + args[1]) : '')+(note||'')+(kwargs.u ? (' ' + ((kwargs.up && (kwargs.u.includes('⋅') || kwargs.u.includes('/'))) ? ('(' + kwargs.u + ')') : kwargs.u)) : '')+(kwargs.up ? ('/' + ((kwargs.up.includes('⋅') || kwargs.up.includes('/')) ? ('(' + kwargs.up + ')') : kwargs.up)) : '')+(kwargs.s||'')+'</span>'
    },
    'western name order': (args, kwargs) => hatnote(`The native form of this [[personal name]] is ${args[0]}. This article uses [[Personal name#Western Name order|Western name order]] when mentioning individuals.`, kwargs)
}
const mediawikiRedirects = {
    ',': '·',
    '--': 'em dash',
    '*': '•',
    'as written': 'not a typo',
    'bull': '•',
    'bullet': '•',
    'chem name': 'not a typo',
    'dash': 'spaced en dash',
    'dot': '·',
    'eastern name order': 'western name order',
    'emdash': 'em dash',
    'endash': 'en dash',
    'hash': 'number sign',
    'hungarian name': 'western name order',
    'mdash': 'em dash',
    'middot': '·',
    'nat': 'not a typo',
    'ndash': 'en dash',
    'not typo': 'not a typo',
    'nsndns': 'en dash',
    'pl': 'plainlist',
    'proper name': 'not a typo',
    'snd': 'spaced en dash',
    'sndash': 'spaced en dash',
    'space': 'spaces',
    'spnd': 'spaced en dash',
    'spndash': 'spaced en dash',
    'tji': 'template journal inline',
    'tl': 'template link',
    'tlc': 'template link code',
    'tlg': 'template link general',
    'tlx': 'template link expanded',
    'tsh': 'template shortcut',
    'typo': 'not a typo'
}

const moduleHandlers = {
    ...mediawiki,
    ...Object.fromEntries(Object.entries(mediawikiRedirects).map(([k,v])=>[k,mediawiki[v]]))
}

Wiklo.moduleHandlers = {...Wiklo.moduleHandlers, ...moduleHandlers}

})()