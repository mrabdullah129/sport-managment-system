import React from 'react';

const developers = [
  {
    role: 'Team Leader',
    icon: '👑',
    name: 'M Abdullah',
    description:
      'Strategic and hands-on full-stack developer leading architecture, system planning, and scalable product execution.',
    image:
      'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1200&q=80',
    portfolio: 'https://muhammadabdullahwali.vercel.app/',
    highlighted: true
  },
  {
    role: 'Developer',
    icon: '💻',
    name: 'Atif',
    description:
      'Creative and detail-focused developer with strong expertise in modern frontend technologies.',
    image:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    portfolio: 'https://atif-portfolio-nine.vercel.app/'
  },
  {
    role: 'Developer',
    icon: '💻',
    name: 'M Abdullah',
    description:
      'Passionate developer focused on backend systems, APIs, and performance optimization.',
    image:
      'https://images.unsplash.com/photo-1526378800651-c32d170fe6f8?auto=format&fit=crop&w=1200&q=80',
    portfolio: 'https://portfolio-omega-jet-b832nexgmd.vercel.app/'
  }
];

const About = () => {
  return (
    <section className="min-h-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-white shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9M10.5 12h9m-9 6h9M4.5 6h.008v.008H4.5V6Zm0 6h.008v.008H4.5V12Zm0 6h.008v.008H4.5V18Z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">About</h1>
        </div>

        <div className="mb-8 rounded-2xl bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.12)] ring-1 ring-slate-200 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900">About This System</h2>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Sports Equipment Management System helps institutions manage equipment inventory, issue and return workflows,
            and transaction tracking in one organized dashboard.
          </p>

          <div className="mt-4 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 ring-1 ring-blue-100">
            <span className="mr-2">🚀</span>
            Version 1.0
          </div>
        </div>
      </div>

      <div
        className="relative w-full overflow-hidden"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=2200&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-slate-900/80" />

        <div className="relative mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            The talented minds building this system
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {developers.map((dev) => (
              <article
                key={dev.name}
                className={`group relative h-[470px] overflow-hidden rounded-3xl shadow-[0_16px_35px_rgba(2,6,23,0.42)] ring-1 ${
                  dev.highlighted ? 'ring-amber-300/80' : 'ring-white/20'
                }`}
              >
                <div
                  className="absolute inset-0 scale-100 transition-transform duration-500 ease-out group-hover:scale-110"
                  style={{
                    backgroundImage: `url('${dev.image}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/65 to-slate-800/10 transition-all duration-500 group-hover:from-slate-900 group-hover:via-slate-800/55" />

                <div className="relative flex h-full flex-col justify-end p-6 text-white">
                  <p className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide ${
                    dev.highlighted ? 'bg-amber-400/85 text-slate-900' : 'bg-sky-500/85 text-white'
                  }`}>
                    <span aria-hidden="true">{dev.icon}</span>
                    <span>{dev.role}</span>
                  </p>

                  <h3 className={`mt-4 text-5xl font-black leading-none ${dev.highlighted ? 'text-amber-300' : 'text-white'} sm:text-6xl lg:text-5xl`}>
                    {dev.name}
                  </h3>

                  <p className="mt-4 max-w-lg text-lg leading-8 text-slate-200">{dev.description}</p>

                  {dev.portfolio ? (
                    <a
                      href={dev.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 block w-full rounded-xl bg-white/95 px-4 py-3 text-center text-lg font-semibold text-slate-800 shadow-sm transition-all duration-300 hover:bg-white"
                    >
                      View Portfolio
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="mt-6 w-full rounded-xl bg-white/95 px-4 py-3 text-lg font-semibold text-slate-800 shadow-sm transition-all duration-300 hover:bg-white"
                    >
                      View Portfolio
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
