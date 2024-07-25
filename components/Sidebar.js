import Link from 'next/link';

const sidebarItems = [
  { icon: '🧙‍♂️', text: 'Magic Tools', href: '/tools' },
  { icon: '📜', text: 'Output History', href: '/history' },
//   { icon: '🤖', text: 'Raina (Chatbot)', href: '/chatbot' },
//   { icon: '📜', text: 'Output History', href: '/history' },
//   { icon: '🚀', text: 'Launch to Students', href: '/launch' },
//   { icon: '❤️', text: 'Love', href: '/love' },
//   { icon: '🎓', text: 'Training', href: '/training' },
//   { icon: '✨', text: 'Share the Magic', href: '/share' },
//   { icon: '🐰', text: 'MagicStudent Intro', href: '/intro' },
//   { icon: '⬆️', text: 'Upgrade', href: '/upgrade' },
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-white shadow-lg h-screen p-4">
      <div className="text-2xl font-bold text-purple-600 mb-8">Vizuara</div>
      <nav>
        {sidebarItems.map((item, index) => (
          <Link key={index} href={item.href}>
            <div className="flex items-center mb-4 text-gray-700 hover:text-purple-600 cursor-pointer">
              <span className="mr-2">{item.icon}</span>
              <span>{item.text}</span>
            </div>
          </Link>
        ))}
      </nav>
      <div className="mt-auto text-center text-purple-600 font-bold">
        TEACHERS ARE MAGIC
      </div>
    </div>
  );
}