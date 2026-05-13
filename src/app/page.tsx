import Link from "next/link";
import { BookOpen, Users, Map, PenTool, Scroll, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fdfcfb] text-[#2c2416] selection:bg-[#8e5c3a] selection:text-white overflow-hidden flex flex-col font-sans">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-fade-up { animation: fade-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        .delay-500 { animation-delay: 500ms; }
      `}} />

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#e6d5c3] rounded-full blur-[120px] opacity-40 animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#d1c8b8] rounded-full blur-[150px] opacity-30 animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navbar */}
      <header className="relative z-10 py-6 px-8 flex justify-between items-center max-w-7xl mx-auto w-full opacity-0 animate-fade-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#f5f0e8] border border-[#d5c8b5] rounded-full flex items-center justify-center text-[#8e5c3a] shadow-sm">
            <BookOpen size={20} strokeWidth={1.5} />
          </div>
          <span className="font-bold text-xl tracking-tight" style={{ fontFamily: "'Lora', serif" }}>
            Protocolo Códice
          </span>
        </div>
        <Link 
          href="/login"
          className="text-[#8e5c3a] font-medium hover:text-[#5a3a24] transition-colors"
        >
          Entrar
        </Link>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center pt-16 pb-24">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f5f0e8] border border-[#e6d5c3] text-[#7a6e5f] text-sm font-medium mb-8 opacity-0 animate-fade-up delay-100 hover:scale-105 transition-transform cursor-default">
          <Sparkles size={16} className="text-[#8e5c3a]" />
          <span>Sua nova oficina criativa</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-[#2c2416] max-w-4xl tracking-tight mb-6 opacity-0 animate-fade-up delay-200" style={{ fontFamily: "'Lora', serif" }}>
          Dê vida aos seus <br className="hidden md:block" />
          <span className="text-[#8e5c3a] italic pr-4" style={{ fontFamily: "'Caveat', cursive", fontSize: '1.2em' }}>universos literários</span>
        </h1>
        
        <p className="mt-4 text-xl md:text-2xl text-[#7a6e5f] max-w-2xl mb-12 opacity-0 animate-fade-up delay-300 leading-relaxed font-light">
          Uma plataforma completa para autores. Organize capítulos, crie fichas de personagens, mapeie locais e não perca nenhuma ideia.
        </p>
        
        <div className="opacity-0 animate-fade-up delay-400">
          <Link 
            href="/login" 
            className="group relative inline-flex items-center justify-center gap-3 bg-[#2c2416] text-[#fdfcfb] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#4a3e2b] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            <span>Acessar minha Biblioteca</span>
            <PenTool size={20} className="group-hover:rotate-12 transition-transform" />
          </Link>
          <p className="mt-4 text-sm text-[#a39788]">Totalmente gratuito para escritores.</p>
        </div>
      </main>

      {/* Features Grid */}
      <section className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Capítulos",
              desc: "Escreva e organize a estrutura da sua obra sem distrações.",
              icon: BookOpen,
              delay: "delay-200"
            },
            {
              title: "Personagens",
              desc: "Fichas completas de características, inventário e motivações.",
              icon: Users,
              delay: "delay-300"
            },
            {
              title: "Lugares",
              desc: "Mapeie os cenários e defina a atmosfera de cada região.",
              icon: Map,
              delay: "delay-400"
            },
            {
              title: "Anotações",
              desc: "Guarde artefatos, itens e lampejos criativos facilmente.",
              icon: Scroll,
              delay: "delay-500"
            }
          ].map((feature, i) => (
            <div 
              key={i}
              className={`bg-white border border-[#e6d5c3] p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-2 hover:border-[#d1c8b8] transition-all duration-500 opacity-0 animate-fade-up ${feature.delay} group`}
            >
              <div className="w-12 h-12 bg-[#f5f0e8] rounded-xl flex items-center justify-center text-[#8e5c3a] mb-6 group-hover:scale-110 group-hover:bg-[#8e5c3a] group-hover:text-white transition-all duration-500 shadow-inner group-hover:shadow-md">
                <feature.icon size={24} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-[#2c2416] mb-3" style={{ fontFamily: "'Lora', serif" }}>
                {feature.title}
              </h3>
              <p className="text-[#7a6e5f] leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}