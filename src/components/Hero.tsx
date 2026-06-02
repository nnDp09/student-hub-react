export function Hero() {
  return (
    <section className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-start">

          {/* Texto */}
          <div>
            <h1 className="text-4xl font-bold text-[#003B7A] leading-tight">
              Apoyamos tu vida universitaria
            </h1>

            <p className="mt-4 text-lg text-gray-700">
              Encuentra beneficios, apoyos y recursos para tu desarrollo
              académico y personal.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#beneficios"
                className="bg-[#005EB8] text-white px-6 py-3 rounded-md font-semibold hover:bg-[#004a91] transition"
              >
                Conoce nuestros beneficios
              </a>

              <a
                href="#servicios"
                className="border border-[#005EB8] text-[#005EB8] px-6 py-3 rounded-md font-semibold hover:bg-blue-50 transition"
              >
                Ver servicios estudiantiles
              </a>
            </div>
          </div>

          {/* Foto */}
          <div className="hidden lg:block">
            <img
              src="https://usm.cl/wp-content/uploads/2021/07/1-1.jpg"
              alt="Universidad Técnica Federico Santa María"
              className="w-full h-[280px] object-cover rounded-xl shadow-lg"
            />
          </div>

        </div>
      </div>
    </section>
  );
}