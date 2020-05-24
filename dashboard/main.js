const Main = {}



Main.oninit = vnode => {


    m.route.set('login')

    /*Toggle dropdown list*/
    vnode.state.toggleDD = myDropMenu => e => {
        document.getElementById(myDropMenu).classList.toggle("invisible");
    }
    /*Filter dropdown options*/
    vnode.state.filterDD = (myDropMenu, myDropMenuSearch) => e =>  {
        var input, filter, ul, li, a, i;
        input = document.getElementById(myDropMenuSearch);
        filter = input.value.toUpperCase();
        div = document.getElementById(myDropMenu);
        a = div.getElementsByTagName("a");
        for (i = 0; i < a.length; i++) {
            if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
                a[i].style.display = "";
            } else {
                a[i].style.display = "none";
            }
        }
    }
    // Close the dropdown menu if the user clicks outside of it
    window.onclick = function(event) {
        if (!event.target.matches('.drop-button') && !event.target.matches('.drop-search')) {
            var dropdowns = document.getElementsByClassName("dropdownlist");
            for (var i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if (!openDropdown.classList.contains('invisible')) {
                    openDropdown.classList.add('invisible');
                }
            }
        }
    }
}

Main.oncreate = vnode => {

    new Chart(document.getElementById("chartjs-7"), {
        "type": "bar",
        "data": {
            "labels": ["January", "February", "March", "April"],
            "datasets": [{
                "label": "Page Impressions",
                "data": [10, 20, 30, 40],
                "borderColor": "rgb(255, 99, 132)",
                "backgroundColor": "rgba(255, 99, 132, 0.2)"
            }, {
                "label": "Adsense Clicks",
                "data": [5, 15, 10, 30],
                "type": "line",
                "fill": false,
                "borderColor": "rgb(54, 162, 235)"
            }]
        },
        "options": {
            "scales": {
                "yAxes": [{
                    "ticks": {
                        "beginAtZero": true
                    }
                }]
            }
        }
    })


    new Chart(document.getElementById("chartjs-0"), {
        "type": "line",
        "data": {
            "labels": ["January", "February", "March", "April", "May", "June", "July"],
            "datasets": [{
                "label": "Views",
                "data": [65, 59, 80, 81, 56, 55, 40],
                "fill": false,
                "borderColor": "rgb(75, 192, 192)",
                "lineTension": 0.1
            }]
        },
        "options": {}
    })


    new Chart(document.getElementById("chartjs-1"), {
        "type": "bar",
        "data": {
            "labels": ["January", "February", "March", "April", "May", "June", "July"],
            "datasets": [{
                "label": "Likes",
                "data": [65, 59, 80, 81, 56, 55, 40],
                "fill": false,
                "backgroundColor": ["rgba(255, 99, 132, 0.2)", "rgba(255, 159, 64, 0.2)", "rgba(255, 205, 86, 0.2)", "rgba(75, 192, 192, 0.2)", "rgba(54, 162, 235, 0.2)", "rgba(153, 102, 255, 0.2)", "rgba(201, 203, 207, 0.2)"],
                "borderColor": ["rgb(255, 99, 132)", "rgb(255, 159, 64)", "rgb(255, 205, 86)", "rgb(75, 192, 192)", "rgb(54, 162, 235)", "rgb(153, 102, 255)", "rgb(201, 203, 207)"],
                "borderWidth": 1
            }]
        },
        "options": {
            "scales": {
                "yAxes": [{
                    "ticks": {
                        "beginAtZero": true
                    }
                }]
            }
        }
    })


    new Chart(document.getElementById("chartjs-4"), {
        "type": "doughnut",
        "data": {
            "labels": ["P1", "P2", "P3"],
            "datasets": [{
                "label": "Issues",
                "data": [300, 50, 100],
                "backgroundColor": ["rgb(255, 99, 132)", "rgb(54, 162, 235)", "rgb(255, 205, 86)"]
            }]
        }
    })
}

Main.view = vnode => {

    return [

        m('div', {class:"bg-gray-900 font-sans leading-normal tracking-normal mt-12"}, [

            m('nav', {class:"bg-gray-900 pt-2 md:pt-1 pb-1 px-1 mt-0 h-auto fixed w-full z-20 top-0"}, [

                m('div', {class:"flex flex-wrap items-center"}, [
                    m('div', {class:"flex flex-shrink md:w-1/3 justify-center md:justify-start text-white"}, [
                        m('a', {href:"#"}, [
                            m('span', {class:"text-xl pl-2"}, [
                                m('i', {class:"em em-grinning"})
                            ]),
                        ]),
                    ]),

                    m('div', {class:"flex flex-1 md:w-1/3 justify-center md:justify-start text-white px-2"}, [
                        m('span', {class:"relative w-full"}, [
                            m('input', {type:"search", placeholder:"Search", class:"w-full bg-gray-800 text-sm text-white transition border border-transparent focus:outline-none focus:border-gray-700 rounded py-1 px-2 pl-10 appearance-none leading-normal"}),
                            m('div', {class:"absolute search-icon", style:"top: .5rem; left: .8rem;"}, [
                                m('svg', {class:"fill-current pointer-events-none text-white w-4 h-4", xmlns:"http://www.w3.org/2000/svg", viewBox:"0 0 20 20"}, [
                                    m('path', {d:"M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z"}),
                                ]),
                            ]),
                        ]),
        			]),

        			m('div', {class:"flex w-full pt-2 content-center justify-between md:w-1/3 md:justify-end"}, [
        				m('ul', {class:"list-reset flex justify-between flex-1 md:flex-none items-center"}, [
        				    m('li', {class:"flex-1 md:flex-none md:mr-3"}, [
        					    m('a', {class:"inline-block py-2 px-4 text-white no-underline", href:"#"}, 'Active'),
        				    ]),
        				    m('li', {class:"flex-1 md:flex-none md:mr-3"}, [
        					    m('a', {class:"inline-block text-gray-600 no-underline hover:text-gray-200 hover:text-underline py-2 px-4", href:"#"}, 'link'),
        				    ]),
        				    m('li', {class:"flex-1 md:flex-none md:mr-3"}, [
        						m('div', {class:"relative inline-block"}, [
        							m('button', {onclick:vnode.state.toggleDD('myDropdown'), class:"drop-button text-white focus:outline-none"}, [
                                        m('span', {class:"pr-2"}, [
                                            m('i', {class:"em em-robot_face"}),
                                        ]),
                                        'Hi, User',
                                        m('svg', {class:"h-3 fill-current inline", xmlns:"http://www.w3.org/2000/svg", viewBox:"0 0 20 20"}, [
                                            m('path', {d:"M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"})
                                        ]),
                                    ]),
                                    m('div', {id:"myDropdown", class:"dropdownlist absolute bg-gray-900 text-white right-0 mt-3 p-3 overflow-auto z-30 invisible"}, [
                                        m('input', {type:"text", class:"drop-search p-2 text-gray-600", placeholder:"Search..", id:"myInput", onkeyup:vnode.state.filterDD('myDropdown','myInput')}),
                                        m('a', {href:"#", class:"p-2 hover:bg-gray-800 text-white text-sm no-underline hover:no-underline block"}, [
                                            m('i', {class:"fa fa-user fa-fw"}),
                                            'Profile',
                                        ]),
                                        m('a', {href:"#", class:"p-2 hover:bg-gray-800 text-white text-sm no-underline hover:no-underline block"}, [
                                            m('i', {class:"fa fa-cog fa-fw"}),
                                            'Settings',
                                        ]),
                                        m('div', {class:"border border-gray-800"}),
                                        m('a', {href:"#", class:"p-2 hover:bg-gray-800 text-white text-sm no-underline hover:no-underline block"}, [
                                            m('i', {class:"fas fa-sign-out-alt fa-fw"}),
                                            'Log Out',
                                        ]),
                                    ]),
                                ]),
                            ]),
                        ]),
                    ]),
                ]),
            ]),


            m('div', {class:"flex flex-col md:flex-row"}, [

                m('div', {class:"bg-gray-900 shadow-lg h-16 fixed bottom-0 mt-12 md:relative md:h-screen z-10 w-full md:w-48"}, [

                    m('div', {class:"md:mt-12 md:w-48 md:fixed md:left-0 md:top-0 content-center md:content-start text-left justify-between"}, [
                        m('ul', {class:"list-reset flex flex-row md:flex-col py-0 md:py-3 px-1 md:px-2 text-center md:text-left"}, [
                            m('li', {class:"mr-3 flex-1"}, [
                                m('a', {href:"#", class:"block py-1 md:py-3 pl-1 align-middle text-white no-underline hover:text-white border-b-2 border-gray-800 hover:border-pink-500"}, [
                                    
                                    m('i', {class:"fas fa-tasks pr-0 md:pr-3"}, [
                                    ]),
                                    m('span', {class:"pb-1 md:pb-0 text-xs md:text-base text-gray-600 md:text-gray-400 block md:inline-block"}, ['Tasks']),
                                ]),
                            ]),
                            m('li', {class:"mr-3 flex-1"}, [
                                m('a', {href:"#", class:"block py-1 md:py-3 pl-1 align-middle text-white no-underline hover:text-white border-b-2 border-gray-800 hover:border-purple-500"}, [
                                    
                                    m('i', {class:"fa fa-envelope pr-0 md:pr-3"}, [
                                    ]),
                                    m('span', {class:"pb-1 md:pb-0 text-xs md:text-base text-gray-600 md:text-gray-400 block md:inline-block"}, ['Messages']),
                                ]),
                            ]),
                            m('li', {class:"mr-3 flex-1"}, [
                                m('a', {href:"#", class:"block py-1 md:py-3 pl-1 align-middle text-white no-underline hover:text-white border-b-2 border-blue-600"}, [
                                    
                                    m('i', {class:"fas fa-chart-area pr-0 md:pr-3 text-blue-600"}, [
                                    ]),
                                    m('span', {class:"pb-1 md:pb-0 text-xs md:text-base text-white md:text-white block md:inline-block"}, ['Analytics']),
                                ]),
                            ]),
                            m('li', {class:"mr-3 flex-1"}, [
                                m('a', {href:"#", class:"block py-1 md:py-3 pl-0 md:pl-1 align-middle text-white no-underline hover:text-white border-b-2 border-gray-800 hover:border-red-500"}, [
                                    
                                    m('i', {class:"fa fa-wallet pr-0 md:pr-3"}, [
                                    ]),
                                    m('span', {class:"pb-1 md:pb-0 text-xs md:text-base text-gray-600 md:text-gray-400 block md:inline-block"}, ['Payments']),
                                ]),
                            ]),
                        ]),
                    ]),


                ]),

                m('div', {class:"main-content flex-1 bg-gray-100 mt-12 md:mt-2 pb-24 md:pb-5"}, [

                    m('div', {class:"bg-blue-800 p-2 shadow text-xl text-white"}, [
                        m('h3', {class:"font-bold pl-2"}, ['Analytics']),
                    ]),

                    m('div', {class:"flex flex-wrap"}, [
                        m('div', {class:"w-full md:w-1/2 xl:w-1/3 p-3"}, [
                            m('div', {class:"bg-green-100 border-b-4 border-green-600 rounded-lg shadow-lg p-5"}, [
                                m('div', {class:"flex flex-row items-center"}, [
                                    m('div', {class:"flex-shrink pr-4"}, [
                                        m('div', {class:"rounded-full p-5 bg-green-600"}, [
                                            m('i', {class:"fa fa-wallet fa-2x fa-inverse"}),
                                        ]),
                                    ]),
                                    m('div', {class:"flex-1 text-right md:text-center"}, [
                                        m('h5', {class:"font-bold uppercase text-gray-600"}, ['Total Revenue']),
                                        m('h3', {class:"font-bold text-3xl"}, ['$3249', m('span', {class:"text-green-500"}, [
                                            m('i', {class:"fas fa-caret-up"}),
                                        ]),]),
                                    ]),
                                ]),
                            ]),
                        ]),
                        m('div', {class:"w-full md:w-1/2 xl:w-1/3 p-3"}, [
                            m('div', {class:"bg-orange-100 border-b-4 border-orange-500 rounded-lg shadow-lg p-5"}, [
                                m('div', {class:"flex flex-row items-center"}, [
                                    m('div', {class:"flex-shrink pr-4"}, [
                                        m('div', {class:"rounded-full p-5 bg-orange-600"}, [
                                            m('i', {class:"fas fa-users fa-2x fa-inverse"}),
                                        ]),
                                    ]),
                                    m('div', {class:"flex-1 text-right md:text-center"}, [
                                        m('h5', {class:"font-bold uppercase text-gray-600"}, ['Total Users']),
                                        m('h3', {class:"font-bold text-3xl"}, [249, m('span', {class:"text-orange-500"}, [
                                            m('i', {class:"fas fa-exchange-alt"}),
                                        ]),]),
                                    ]),
                                ]),
                            ]),
                        ]),
                        m('div', {class:"w-full md:w-1/2 xl:w-1/3 p-3"}, [
                            m('div', {class:"bg-yellow-100 border-b-4 border-yellow-600 rounded-lg shadow-lg p-5"}, [
                                m('div', {class:"flex flex-row items-center"}, [
                                    m('div', {class:"flex-shrink pr-4"}, [
                                        m('div', {class:"rounded-full p-5 bg-yellow-600"}, [
                                            m('i', {class:"fas fa-user-plus fa-2x fa-inverse"}),
                                        ]),
                                    ]),
                                    m('div', {class:"flex-1 text-right md:text-center"}, [
                                        m('h5', {class:"font-bold uppercase text-gray-600"}, ['New Users']),
                                        m('h3', {class:"font-bold text-3xl"}, [2, m('span', {class:"text-yellow-600"}, [
                                            m('i', {class:"fas fa-caret-up"}),
                                        ]),]),
                                    ]),
                                ]),
                            ]),
                        ]),
                        m('div', {class:"w-full md:w-1/2 xl:w-1/3 p-3"}, [
                            m('div', {class:"bg-blue-100 border-b-4 border-blue-500 rounded-lg shadow-lg p-5"}, [
                                m('div', {class:"flex flex-row items-center"}, [
                                    m('div', {class:"flex-shrink pr-4"}, [
                                        m('div', {class:"rounded-full p-5 bg-blue-600"}, [
                                            m('i', {class:"fas fa-server fa-2x fa-inverse"}),
                                        ]),
                                    ]),
                                    m('div', {class:"flex-1 text-right md:text-center"}, [
                                        m('h5', {class:"font-bold uppercase text-gray-600"}, ['Server Uptime']),
                                        m('h3', {class:"font-bold text-3xl"}, ['152 days']),
                                    ]),
                                ]),
                            ]),
                        ]),
                        m('div', {class:"w-full md:w-1/2 xl:w-1/3 p-3"}, [
                            m('div', {class:"bg-indigo-100 border-b-4 border-indigo-500 rounded-lg shadow-lg p-5"}, [
                                m('div', {class:"flex flex-row items-center"}, [
                                    m('div', {class:"flex-shrink pr-4"}, [
                                        m('div', {class:"rounded-full p-5 bg-indigo-600"}, [
                                            m('i', {class:"fas fa-tasks fa-2x fa-inverse"}),
                                        ]),
                                    ]),
                                    m('div', {class:"flex-1 text-right md:text-center"}, [
                                        m('h5', {class:"font-bold uppercase text-gray-600"}, ['To Do List']),
                                        m('h3', {class:"font-bold text-3xl"}, ['7 tasks']),
                                    ]),
                                ]),
                            ]),
                        ]),
                        m('div', {class:"w-full md:w-1/2 xl:w-1/3 p-3"}, [
                            m('div', {class:"bg-red-100 border-b-4 border-red-500 rounded-lg shadow-lg p-5"}, [
                                m('div', {class:"flex flex-row items-center"}, [
                                    m('div', {class:"flex-shrink pr-4"}, [
                                        m('div', {class:"rounded-full p-5 bg-red-600"}, [
                                            m('i', {class:"fas fa-inbox fa-2x fa-inverse"}),
                                        ]),
                                    ]),
                                    m('div', {class:"flex-1 text-right md:text-center"}, [
                                        m('h5', {class:"font-bold uppercase text-gray-600"}, ['Issues']),
                                        m('h3', {class:"font-bold text-3xl"}, [3, m('span', {class:"text-red-500"}, [
                                            m('i', {class:"fas fa-caret-up"}),
                                        ]),]),
                                    ]),
                                ]),
                            ]),
                        ]),
                    ]),


                    m('div', {class:"flex flex-row flex-wrap flex-grow mt-2"}, [

                        m('div', {class:"w-full md:w-1/2 xl:w-1/3 p-3"}, [
                            m('div', {class:"bg-white border-transparent rounded-lg shadow-lg"}, [
                                m('div', {class:"bg-gray-400 uppercase text-gray-800 border-b-2 border-gray-500 rounded-tl-lg rounded-tr-lg p-2"}, [
                                    m('h5', {class:"font-bold uppercase text-gray-600"}, ['Graph']),
                                ]),
                                m('div', {class:"p-5"}, [
                                    m('canvas', {id:"chartjs-7", class:"chartjs", width:"undefined", height:"undefined"}),
                                ]),
                            ]),
                        ]),

                        m('div', {class:"w-full md:w-1/2 xl:w-1/3 p-3"}, [
                            m('div', {class:"bg-white border-transparent rounded-lg shadow-lg"}, [
                                m('div', {class:"bg-gray-400 border-b-2 border-gray-500 rounded-tl-lg rounded-tr-lg p-2"}, [
                                    m('h5', {class:"font-bold uppercase text-gray-600"}, ['Graph']),
                                ]),
                                m('div', {class:"p-5"}, [
                                    m('canvas', {id:"chartjs-0", class:"chartjs", width:"undefined", height:"undefined"}),
                                ]),
                            ]),
                        ]),

                        m('div', {class:"w-full md:w-1/2 xl:w-1/3 p-3"}, [
                            m('div', {class:"bg-white border-transparent rounded-lg shadow-lg"}, [
                                m('div', {class:"bg-gray-400 border-b-2 border-gray-500 rounded-tl-lg rounded-tr-lg p-2"}, [
                                    m('h5', {class:"font-bold uppercase text-gray-600"}, ['Graph']),
                                ]),
                                m('div', {class:"p-5"}, [
                                    m('canvas', {id:"chartjs-1", class:"chartjs", width:"undefined", height:"undefined"}),
                                ]),
                            ]),
                        ]),

                        m('div', {class:"w-full md:w-1/2 xl:w-1/3 p-3"}, [
                            m('div', {class:"bg-white border-transparent rounded-lg shadow-lg"}, [
                                m('div', {class:"bg-gray-400 border-b-2 border-gray-500 rounded-tl-lg rounded-tr-lg p-2"}, [
                                    m('h5', {class:"font-bold uppercase text-gray-600"}, ['Graph']),
                                ]),
                                m('div', {class:"p-5"}, [
                                    m('canvas', {id:"chartjs-4", class:"chartjs", width:"undefined", height:"undefined"})
                                ]),
                            ]),
                        ]),

                        m('div', {class:"w-full md:w-1/2 xl:w-1/3 p-3"}, [
                            m('div', {class:"bg-white border-transparent rounded-lg shadow-lg"}, [
                                m('div', {class:"bg-gray-400 border-b-2 border-gray-500 rounded-tl-lg rounded-tr-lg p-2"}, [
                                    m('h5', {class:"font-bold uppercase text-gray-600"}, ['Table']),
                                ]),
                                m('div', {class:"p-5"}, [
                                    m('table', {class:"w-full p-5 text-gray-700"}, [
                                        m('thead', {}, [
                                            m('tr', {}, [
                                                m('th', {class:"text-left text-blue-900"}, ["Name"]),
                                                m('th', {class:"text-left text-blue-900"}, ["Side"]),
                                                m('th', {class:"text-left text-blue-900"}, ["Role"]),
                                            ]),
                                        ]),

                                        m('tbody', {}, [
                                            m('tr', {}, [
                                                m('td', {}, ["Obi Wan Kenobi"]),
                                                m('td', {}, ["Light"]),
                                                m('td', {}, ["Jedi"]),
                                            ]),
                                            m('tr', {}, [
                                                m('td', {}, ["Greedo"]),
                                                m('td', {}, ["South"]),
                                                m('td', {}, ["Scumbag"]),
                                            ]),
                                            m('tr', {}, [
                                                m('td', {}, ["Darth Vader"]),
                                                m('td', {}, ["Dark"]),
                                                m('td', {}, ["Sith"]),
                                            ]),
                                        ]),
                                    ]),

                                    m('p', {class:"py-2"}, [
                                        m('a', {href:"#"}, "See More issues..."),
                                    ]),

                                ]),
                            ]),
                        ]),

                        m('div', {class:"w-full md:w-1/2 xl:w-1/3 p-3"}, [
                            m('div', {class:"bg-white border-transparent rounded-lg shadow-lg"}, [
                                m('div', {class:"bg-gray-400 border-b-2 border-gray-500 rounded-tl-lg rounded-tr-lg p-2"}, [
                                    m('h5', {class:"font-bold uppercase text-gray-600"}, ["Template"]),
                                ]),
                                m('div', {class:"p-5"}),
                            ]),
                        ]),
                    ]),
                ]),

            ]),
        ])

    ]
}

