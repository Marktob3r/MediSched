import { Link } from "react-router";
import { motion } from "motion/react";
import {
  Calendar, Clock, Shield, Smartphone,
  Phone, MapPin, Mail, CheckCircle, HeartPulse,
  Users, Activity, Bell
} from "lucide-react";
import { PublicNavbar } from "../layout/PublicNavbar";

const HERO_IMG = "https://images.unsplash.com/photo-1761853320977-bcd046cfaea9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBtZWRpY2FsJTIwY2xpbmljJTIwcmVjZXB0aW9uJTIwZ3JlZW58ZW58MXx8fHwxNzc0MjI5OTAyfDA&ixlib=rb-4.1.0&q=80&w=1080";
const DOCTOR_IMG = "src/assets/doc.jpg";

const features = [
  { icon: Calendar, title: "24/7 Online Booking", desc: "Book appointments anytime, anywhere without calling the clinic." },
  { icon: Shield, title: "No Double-Bookings", desc: "Smart scheduling prevents conflicts and guarantees your slot." },
  { icon: Smartphone, title: "SMS Notifications", desc: "Receive instant confirmations and reminders via text message." },
  { icon: Clock, title: "Real-Time Updates", desc: "Stay informed with live appointment status and schedule changes." },
];

const steps = [
  { num: "01", title: "Create Account", desc: "Register in minutes." },
  { num: "02", title: "Choose Date & Time", desc: "Browse available slots and pick what works best for you." },
  { num: "03", title: "Receive Confirmation", desc: "Get an instant SMS confirmation with your appointment details." },
  { num: "04", title: "Visit the Clinic", desc: "Arrive at your scheduled time — no waiting in line to register." },
];

const services = [
  "Heart and Blood Pressure Management",
  "Diet and Natural Lifestyle",
  "Diabetes Rehabilitation",
  "Kidney Integrative Analysis",
  "Liver Rejuvenation",
  "Brain and Nerve Rejuvenation",
  "Lung Rehabilitation",
  "Physical Pain Management",
  "And more..."
];

const stats = [
  { icon: Users, value: "1,000+", label: "Patients Served" },
  { icon: Calendar, value: "98%", label: "On-Time Rate" },
  { icon: Activity, value: "15+", label: "Years Experience" },
  { icon: Bell, value: "24/7", label: "Online Booking" },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-[Montserrat] select-none overflow-x-hidden">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="Medical Clinic" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 via-green-800/70 to-green-700/30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span className="inline-flex items-center gap-2 bg-green-400/20 border border-green-400/30 text-green-200 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
                <HeartPulse className="w-4 h-4" />
                Samuel P. Dizon Medical Clinic
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                Your Health,<br />
                <span className="text-green-300">Scheduled</span><br />
                Smarter.
              </h1>
              <p className="text-green-100 text-lg sm:text-xl mb-8 leading-relaxed">
                Book appointments online 24/7, receive instant SMS notifications, and experience hassle-free healthcare at Samuel P. Dizon Medical Clinic.
              </p>
              {/* <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/book"
                  className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-green-500/30 text-lg"
                >
                  <Calendar className="w-5 h-5" />
                  Book an Appointment
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-8 py-4 rounded-xl transition-all text-lg backdrop-blur-sm"
                >
                  Patient Login
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div> */}

              {/* Quick Info */}
              <div className="mt-10 flex flex-wrap gap-6">
                <div className="flex items-center gap-2 text-green-200">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium">Free Registration</span>
                </div>
                <div className="flex items-center gap-2 text-green-200">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium">Instant Confirmation</span>
                </div>
                <div className="flex items-center gap-2 text-green-200">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium">No Double-Bookings</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center pt-2"
          >
            <div className="w-1.5 h-3 bg-white/60 rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-green-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map(({ icon: Icon, value, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 mx-auto mb-3">
                  <Icon className="w-6 h-6 text-green-200" />
                </div>
                <div className="text-3xl font-extrabold text-white mb-1">{value}</div>
                <div className="text-green-200 text-sm font-medium">{label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">Why Choose MediSched</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2 mb-4">
              Smarter Healthcare Scheduling
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Our intelligent scheduling system eliminates paperwork and administrative bottlenecks so you can focus on what matters most — your health.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 hover:shadow-md hover:-translate-y-1 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">Simple Process</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">How It Works</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map(({ num, title, desc }, i) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-green-200 z-0" style={{ width: "calc(100% - 2rem)", left: "calc(50% + 2rem)" }} />
                )}
                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-green-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
                    <span className="text-white font-extrabold text-xl">{num}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* <div className="text-center mt-12">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg"
            >
              <Calendar className="w-5 h-5" />
              Get Started — Sign Up Now!
            </Link>
          </div> */}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <img src={DOCTOR_IMG} alt="Doctor" className="rounded-2xl shadow-xl w-full object-cover h-96" draggable="false" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">About the Clinic</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2 mb-4">
                Samuel P. Dizon<br />Medical Clinic
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                For over 15 years, Samuel P. Dizon Medical Clinic has been providing quality healthcare services to our community. Our dedicated medical team is committed to delivering personalized, compassionate care.
              </p>
              <div className="space-y-3 mb-8">
                {services.map((s) => (
                  <div key={s} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm font-medium">{s}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-green-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Ready to Book Your Appointment?
            </h2>
            <p className="text-green-200 text-lg mb-8">
              Join thousands of patients who schedule smarter with MediSched.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* <Link to="/book" className="inline-flex items-center justify-center gap-2 bg-white text-green-700 font-bold px-8 py-4 rounded-xl hover:bg-green-50 transition-all shadow-lg text-lg">
                <Calendar className="w-5 h-5" />
                Book Appointment
              </Link> */}
              <Link to="/login" className="inline-flex items-center justify-center gap-2 border-2 border-white/50 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-all text-lg">
                Sign Up Now!
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer / Contact */}
      <footer id="contact" className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <HeartPulse className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-bold">MediSched</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Intelligent Cloud-Based Scheduling & SMS Notification Solution for Samuel P. Dizon Medical Clinic.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {["Patient Login", "Admin Login"].map((item) => (
                  <li key={item}>
                    <Link to={item === "Book Appointment" ? "/book" : "/login"} className="text-gray-400 hover:text-green-400 text-sm transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div id="contact-info">
              <h4 className="text-white font-bold mb-4">Contact Us</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-gray-400 text-sm">
                  <MapPin className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>2nd Floor Centrepoint Building, Magsaysay Drive Rizal Avenue, East Tapinac, Olongapo City</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400 text-sm">
                  <Phone className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>0950 331 3347</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400 text-sm">
                  <Mail className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>thebuj29@yahoo.com</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400 text-sm">
                  <Clock className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Mon–Thurs: 9:00 AM – 5:00 PM<br />Friday: 9:00 AM – 4:00 PM</span>
                </li>
              </ul>
            </div>  
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              © 2026 Samuel P. Dizon Medical Clinic. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
