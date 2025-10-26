"use client"

import { motion } from "framer-motion"

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="py-8 px-6 border-t border-[#E0DEDB] bg-white"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-2xl font-semibold text-[#37322F]">Rizgeo</div>
        <div className="text-sm text-[#605A57]">
          © {new Date().getFullYear()} Rizgeo. All rights reserved.
        </div>
      </div>
    </motion.footer>
  )
}
