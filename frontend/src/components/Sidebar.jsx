import { NavLink } from 'react-router-dom'

const links = [
    { to:'/',         label:'Dashboard' },
    { to:'/locations',label:'Locations' },
    { to:'/items',    label:'Items'     },
    { to:'/bestiary', label:'Bestiary'  },
    { to:'/quests',    label:'Quests'   },
    { to:'/npcs',      label:'NPCs'     },
    { to:'/spells',    label:'Spells'   }
]

export default function Sidebar() {
    return (
        <nav className="w-48 bg-gray-800 p-4 space-y-2">
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
        </nav>
    )
}