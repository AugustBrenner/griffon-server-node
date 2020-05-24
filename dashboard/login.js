const Login = {}



Login.oninit = vnode => {

    vnode.state.submit = e => {
        
    }
}

Login.oncreate = vnode => {

}

Login.view = vnode => {

    return [

        m('div', {class: "bg-white rounded-t-lg overflow-hidden border-t border-l border-r border-gray-400 p-4 px-3 py-10 bg-gray-200 flex justify-center h-full"}, [
            m('div', {class:"w-full max-w-xs"}, [
                m('form', {class:"bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4", onsubmit: vnode.state.submit}, [
                    m('div', {class:"mb-4"}, [
                        m('label', {class:"block text-gray-700 text-sm font-bold mb-2", for:"username"}, [
                            "Username"
                        ]),
                        m('input', {class:"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline", id:"username", type:"text", placeholder:"Username"}),
                    ]),
                    m('div', {class:"mb-6"}, [
                        m('label', {class:"block text-gray-700 text-sm font-bold mb-2", for:"password"}, [
                            "Password"
                        ]),
                        m('input', {class:"shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline", id:"password", type:"password", placeholder:"******************"}),
                        m('p', {class:"text-red-500 text-xs italic"}, ["Please choose a password."]),
                    ]),
                    m('div', {class:"flex items-center justify-between"}, [
                        m('button', {class:"bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline", type:"button"}, [
                            "Sign In"
                        ]),
                        m('a', {class:"inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800", href:"#"}, [
                            "Forgot Password?"
                        ]),
                    ]),
                ]),
                m('p', {class:"text-center text-gray-500 text-xs"}, [
                    "&copy;2020 Acme Corp. All rights reserved."
                ]),
            ]),
        ])
    ]
}

