import { NavLink } from 'react-router-dom'

const links = [
    { to:'/',         label:'Dashboard' },
    { to:'/locations',label:'Locations' },
    { to:'/items',    label:'Items'     },
    { to:'/bestiary', label:'Bestiary'  },
    { to:'/quests',    label:'Quests'   },
    { to:'/npcs',      label:'NPCs'     },
    { to:'/spells',    label:'Spells'   },
    { to:'/characters',label:'Characters'}
]

export default function Sidebar({ user, onLogout }) {
    return (
        <nav className="w-48 bg-gray-800 p-4 flex flex-col text-yellow-200">
            <div className="space-y-2 flex-1">
                {links.map(l=>(
                    <NavLink
                        key={l.to}
                        to={l.to}
                        className={({isActive})=>
                            `block px-3 py-2 rounded ${isActive?'bg-yellow-700':'hover:bg-gray-700'}`
                        }
                    >
                        {l.label}
                    </NavLink>
                ))}
            </div>

            {user && (
                <div className="border-t border-gray-700 pt-4 mt-4">
                    <div className="px-3 py-2 text-sm text-gray-400">
                        {user.username}
                    </div>
                    <button
                        onClick={onLogout}
                        className="w-full text-left px-3 py-2 rounded text-red-400 hover:bg-gray-700"
                    >
                        Logout
                    </button>
                </div>
            )}
        </nav>
    )
}
