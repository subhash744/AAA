"use client"

import { motion } from "framer-motion"

const steps = [
  {
    number: 1,
    title: "Create Your Profile",
    description: "Sign up and set up your personalized builder profile in minutes",
  },
  {
    number: 2,
    title: "Add Your Projects",
    description: "Showcase your work, share links, and highlight your achievements",
  },
  {
    number: 3,
    title: "Climb the Leaderboard",
    description: "Earn points, collect badges, and rise through the ranks",
  },
]

export default function HowItWorks() {
  return (
    <section className="py-20 px-6 bg-[#F7F5F3]">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-serif text-[#37322F] mb-4">How It Works</h2>
          <p className="text-lg text-[#605A57] max-w-xl mx-auto">
            Get started in three simple steps
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical connecting line */}
          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: "100%" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, delay: 0.3, ease: "easeInOut" }}
            className="absolute left-8 top-0 w-0.5 bg-[#E0DEDB] -z-10"
            style={{ height: "calc(100% - 80px)" }}
          />

          <div className="space-y-12">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.2, ease: "easeInOut" }}
                className="flex gap-6 items-start"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-[#37322F] text-white flex items-center justify-center text-2xl font-bold">
                  {step.number}
                </div>
                <div className="pt-3">
                  <h3 className="text-2xl font-semibold text-[#37322F] mb-2">{step.title}</h3>
                  <p className="text-[#605A57]">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
