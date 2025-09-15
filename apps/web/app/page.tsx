"use client";
import { Button } from "./ui/button";
import Link from "next/link"

import {
  Github,
  Twitter,
  Pencil,
  Share2,
  Users,
  Lock,
  Download,
  Layers,
  Palette,
  Shapes,
  ArrowRight,
  Code,
  Globe,
  Radio,
} from "lucide-react"
import { useEffect, useState } from "react";
import axios from "axios";
import { HTTP_URL } from "./utils";

export default function LandingPage() {

  const [ verified, setVerified ] = useState<boolean>(false);
  useEffect(() => {
    axios.get(`${HTTP_URL}/auth-me`, { withCredentials: true })
      .then((resp) => {
        // console.log(resp);
        setVerified(true);
      })
      .catch((e: any) => {
        // console.log("error = ", e);
      })
  }, []);

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 font-sans">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/80 sticky top-0 z-40 sm:px-10 md:px-15 lg-px-20">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Shapes className="h-8 w-8 text-purple-500" />
              <span className="font-heading text-2xl font-bold">Draw It</span>
            </Link>
          </div>

          {!verified ? <div className="flex items-center gap-3">
            <Link href={'/signin'}>
              <Button 
                variant="ghost"
                size="sm"
                className="hover:bg-zinc-800 hover:text-purple-400"
                children='Log In'
              />
            </Link>
            <Link href={'/signup'}>
              <Button 
                variant="primary" 
                size="sm" 
                className="bg-purple-600 hover:bg-purple-700"
                children='Sign Up' 
              />
            </Link>
            {/* <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button> */}
          </div> :
          <div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="hover:bg-red-700/50" 
              children={'Log Out'} 
              onClick = {
                async () => { 
                  const resp = await axios.get(`${HTTP_URL}/logout`, { withCredentials: true });
                  // console.log("logout resp = ", resp.data);
                }
              }
            />
          </div>
          }
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-16 md:py-24 lg:py-32 sm:px-10 md:px-15 lg-px-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-4">
              <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl/none">
                Create, Collaborate,
                <span className="text-purple-500 block mt-1">Share Your Ideas</span>
              </h1>
              <p className="max-w-[600px] text-zinc-300 text-lg md:text-xl leading-relaxed">
                A powerful virtual whiteboard for sketching diagrams, wireframes, and illustrations. Collaborate in
                real-time with your team and bring your ideas to life.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <div className="flex items-center gap-2 bg-zinc-800/50 px-3 py-1 rounded-full text-sm text-zinc-300">
                  <Pencil className="h-4 w-4 text-purple-400" />
                  <span>Intuitive Drawing</span>
                </div>
                <div className="flex items-center gap-2 bg-zinc-800/50 px-3 py-1 rounded-full text-sm text-zinc-300">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span>Real-time Collaboration</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href={'/canvas'} >
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="bg-purple-600 hover:bg-purple-700 transition-all group"
                  children = {
                    <>
                      Start Drawing
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /> 
                    </>
                  }
                />
              </Link>
              <Link href={'/canvas/2'}>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-zinc-700 hover:bg-zinc-800"
                  children={
                    <>
                      Collaborate Live
                      <Radio className="mr-2 h-4 w-4" />
                    </>
                  }
                />
              </Link>
              <Link href={'https://github.com/armaan357/draw-it'}>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-zinc-700 hover:bg-zinc-800"
                  children={
                    <>
                      View on GitHub
                      <Github className="mr-2 h-4 w-4" />
                    </>
                  }
                />
              </Link>
            </div>
          </div>
          <div className="mx-auto flex w-full items-center justify-center lg:justify-end">
            <div className="relative h-[300px] w-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 p-2 md:h-[400px] group shadow-lg shadow-purple-500/5">
              {/* Canvas Preview */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 p-4">
                  <div className="h-20 w-20 rounded-md bg-purple-500/20 border border-purple-500/30 transition-transform group-hover:rotate-3 duration-300"></div>
                  <div className="h-20 w-20 rounded-full bg-blue-500/20 border border-blue-500/30 transition-transform group-hover:-rotate-3 duration-300"></div>
                  <div className="h-20 w-40 col-span-2 rounded-lg bg-green-500/20 border border-green-500/30 transition-transform group-hover:translate-y-1 duration-300"></div>
                  <div className="h-1 w-32 col-span-2 bg-zinc-700 transition-transform group-hover:translate-x-2 duration-300"></div>
                  <div className="h-1 w-20 col-span-1 bg-zinc-700 transition-transform group-hover:translate-x-1 duration-300"></div>
                </div>
              </div>

              {/* Toolbar */}
              <div className="absolute bottom-2 right-2 flex gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full bg-zinc-800/80 hover:bg-purple-500/20 hover:text-purple-400 transition-colors"
                  children={
                    <Pencil className="h-4 w-4" />
                  }
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full bg-zinc-800/80 hover:bg-blue-500/20 hover:text-blue-400 transition-colors"
                  children = {
                    <Palette className="h-4 w-4" />
                  }
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full bg-zinc-800/80 hover:bg-green-500/20 hover:text-green-400 transition-colors"
                  children = {
                    <Shapes className="h-4 w-4" />
                  }
                />
              </div>

              {/* Cursor Animation */}
              <div
                className="absolute h-6 w-6 rounded-full border-2 border-white opacity-70 animate-ping"
                style={{ top: "30%", left: "40%" }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 lg:py-32 border-t border-zinc-800 bg-zinc-950/50">
        <div className="container">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center mb-16">
            <h2 className="font-heading text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
              Powerful features for your creativity
            </h2>
            <p className="max-w-[85%] leading-relaxed text-zinc-300 text-lg">
              Everything you need to create beautiful sketches and collaborate with your team.
            </p>
          </div>

          <div className="mx-auto grid justify-center gap-6 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3 lg:gap-10">
            {/* Feature 1 */}
            <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 transition-all duration-300 hover:border-purple-500/30 group">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-500/10 text-purple-500 mb-5 transition-transform group-hover:scale-110 duration-300">
                <Pencil className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Intuitive Drawing</h3>
              <p className="text-zinc-300 leading-relaxed">
                Simple yet powerful drawing tools that feel natural and responsive. Create sketches that look
                hand-drawn.
              </p>
              <div className="mt-5">
                <Button
                  variant="link"
                  size="lg"
                  className="p-0 h-auto text-purple-400 group-hover:text-purple-300 transition-colors"
                  children = {
                    <>
                      Learn more
                      <ArrowRight className="ml-1 h-3 w-3 inline" />
                    </>
                  }
                />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 transition-all duration-300 hover:border-blue-500/30 group">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 mb-5 transition-transform group-hover:scale-110 duration-300">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Real-time Collaboration</h3>
              <p className="text-zinc-300 leading-relaxed">
                Work together with your team in real-time. See changes as they happen and collaborate seamlessly.
              </p>
              <div className="mt-5">
                <Button 
                  variant="link"
                  size="lg"
                  className="p-0 h-auto text-blue-400 group-hover:text-blue-300 transition-colors"
                  children = {
                    <>
                      Learn more
                      <ArrowRight className="ml-1 h-3 w-3 inline" />
                    </>
                  } 
                />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 transition-all duration-300 hover:border-green-500/30 group">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-green-500 mb-5 transition-transform group-hover:scale-110 duration-300">
                <Lock className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Open Source</h3>
              <p className="text-zinc-300 leading-relaxed">
                100% open source—explore the code, contribute, or star us on&nbsp;
                <a
                  href="https://github.com/armaan357/draw-it"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline duration-200 hover:text-green-300 transition-colors"
                >
                  GitHub
                </a>
                .
              </p>
              <div className="mt-5">
                <Button
                  variant="link"
                  size="lg"
                  className="p-0 h-auto text-green-400 group-hover:text-green-300 transition-colors"
                  children = {
                    <>
                      Learn more
                      <ArrowRight className="ml-1 h-3 w-3 inline" />
                    </>
                  }
                />
              </div>
            </div>

            {/* Feature 4 */}
            <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 transition-all duration-300 hover:border-yellow-500/30 group">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500 mb-5 transition-transform group-hover:scale-110 duration-300">
                <Share2 className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Easy Sharing</h3>
              <p className="text-zinc-300 leading-relaxed">
                Share your drawings with a simple link. Just Login and share. Perfect for quick collaboration.
              </p>
              <div className="mt-5">
                <Button
                  variant="link"
                  size="lg"
                  className="p-0 h-auto text-yellow-400 group-hover:text-yellow-300 transition-colors"
                  children = {
                    <>
                      Learn more
                      <ArrowRight className="ml-1 h-3 w-3 inline" />
                    </>
                  }
                />
              </div>
            </div>

            {/* Feature 5 */}
            <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 transition-all duration-300 hover:border-red-500/30 group">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500 mb-5 transition-transform group-hover:scale-110 duration-300">
                <Download className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Export Options</h3>
              <p className="text-zinc-300 leading-relaxed">
                Export your drawings as PNG, SVG, or even as a shareable link. Use your creations anywhere.
              </p>
              <div className="mt-5">
                <Button 
                  variant="link"
                  size="lg"
                  className="p-0 h-auto text-red-400 group-hover:text-red-300 transition-colors"
                  children = {
                    <>
                      Learn more
                      <ArrowRight className="ml-1 h-3 w-3 inline" />
                    </>
                  }
                />
              </div>
            </div>

            {/* Feature 6 */}
            <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 transition-all duration-300 hover:border-indigo-500/30 group">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-500 mb-5 transition-transform group-hover:scale-110 duration-300">
                <Layers className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Libraries & Templates</h3>
              <p className="text-zinc-300 leading-relaxed">
                Access a wide range of shapes, templates, and libraries to speed up your work and enhance creativity.
              </p>
              <div className="mt-5">
                <Button
                  variant="link"
                  size="lg"
                  className="p-0 h-auto text-indigo-400 group-hover:text-indigo-300 transition-colors"
                  children = {
                    <>
                      Learn more
                      <ArrowRight className="ml-1 h-3 w-3 inline" />
                    </>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="container py-16 md:py-24 lg:py-32 sm:px-10 md:px-15 lg-px-20">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center mb-16">
          <h2 className="font-heading text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
            Perfect for every creative need
          </h2>
          <p className="max-w-[85%] leading-relaxed text-zinc-300 text-lg">
            From wireframes to diagrams, our tool adapts to your creative process.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Use Case 1 */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 transition-all hover:border-purple-500/20 hover:bg-zinc-900/70">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-500/10 text-purple-500 p-2 rounded-lg">
                <Code className="h-5 w-5" />
              </div>
              <h3 className="font-heading font-bold text-lg">UI/UX Design</h3>
            </div>
            <p className="text-zinc-300">
              Create wireframes and mockups for your next digital product with our intuitive tools.
            </p>
          </div>

          {/* Use Case 2 */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 transition-all hover:border-blue-500/20 hover:bg-zinc-900/70">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-500/10 text-blue-500 p-2 rounded-lg">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-heading font-bold text-lg">Team Brainstorming</h3>
            </div>
            <p className="text-zinc-300">
              Collaborate with your team in real-time to generate and visualize ideas together.
            </p>
          </div>

          {/* Use Case 3 */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 transition-all hover:border-green-500/20 hover:bg-zinc-900/70">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-500/10 text-green-500 p-2 rounded-lg">
                <Globe className="h-5 w-5" />
              </div>
              <h3 className="font-heading font-bold text-lg">Remote Workshops</h3>
            </div>
            <p className="text-zinc-300">
              Run engaging remote workshops with a shared visual canvas that everyone can contribute to.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 lg:py-32 border-t border-zinc-800 bg-zinc-950/50 sm:px-10 md:px-15 lg-px-20">
        <div className="container">
          <div className="mx-auto max-w-[58rem] flex flex-col items-center justify-center gap-6 text-center">
            <h2 className="font-heading text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
              Ready to start drawing?
            </h2>
            <p className="max-w-[85%] leading-relaxed text-zinc-300 text-lg">
              Try our platform today. No sign-up required. It's completely free for personal use.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link href={'/canvas'} >
                <Button 
                  variant="primary"
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 transition-all group"
                  children = {
                    <>
                      Start Drawing Now
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  }
                />
              </Link>
              <Button 
                size="lg"
                variant="outline"
                className="border-zinc-700 hover:bg-zinc-800"
                children = 'View Documentation'
              />
            </div>
            <div className="mt-6 text-zinc-400 text-sm flex items-center gap-2">
              <Lock className="h-4 w-4" />
              No credit card required. No strings attached.
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-950 py-12 sm:px-10 md:px-15 lg-px-20">
        <div className="container grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Shapes className="h-6 w-6 text-purple-500" />
              <span className="font-heading font-bold text-lg">Draw It</span>
            </Link>
            <p className="text-sm text-zinc-400 mt-2">A virtual whiteboard for sketching hand-drawn like diagrams.</p>
            <div className="flex gap-4 mt-4">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8 hover:bg-zinc-800 hover:text-purple-400 transition-colors"
                children = {<Twitter className="h-4 w-4" />}
              />
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8 hover:bg-zinc-800 hover:text-purple-400 transition-colors"
                children = { <Github className="h-4 w-4" /> }
              />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-heading font-medium mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Button 
                  variant="link" 
                  size="lg" 
                  className="p-0 h-auto text-zinc-400 hover:text-purple-400 transition-colors"
                  children = {'Features'} 
                />
              </li>
              <li>
                <Button 
                  variant="link" 
                  size="lg" 
                  className="p-0 h-auto text-zinc-400 hover:text-purple-400 transition-colors"
                  children = {'Pricing'} 
                />
              </li>
              <li>
                <Button 
                  variant="link" 
                  size="lg" 
                  className="p-0 h-auto text-zinc-400 hover:text-purple-400 transition-colors"
                  children = {'Integrations'} 
                />
              </li>
              <li>
                <Button 
                  variant="link" 
                  size="lg" 
                  className="p-0 h-auto text-zinc-400 hover:text-purple-400 transition-colors"
                  children = {'Changelog'} 
                />
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-heading font-medium mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Button 
                  variant="link" 
                  size="lg" 
                  className="p-0 h-auto text-zinc-400 hover:text-purple-400 transition-colors"
                  children = {'Documentation'} 
                />
              </li>
              <li>
                <Button 
                  variant="link" 
                  size="lg" 
                  className="p-0 h-auto text-zinc-400 hover:text-purple-400 transition-colors"
                  children = {'Tutorials'} 
                />
              </li>
              <li>
                <Button 
                  variant="link" 
                  size="lg" 
                  className="p-0 h-auto text-zinc-400 hover:text-purple-400 transition-colors"
                  children = {'Blog'} 
                />
              </li>
              <li>
                <Button 
                  variant="link" 
                  size="lg" 
                  className="p-0 h-auto text-zinc-400 hover:text-purple-400 transition-colors"
                  children = {'Community'} 
                />
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-heading font-medium mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Button 
                  variant="link" 
                  size="lg" 
                  className="p-0 h-auto text-zinc-400 hover:text-purple-400 transition-colors"
                  children = {'About'} 
                />
              </li>
              <li>
                <Button 
                  variant="link" 
                  size="lg" 
                  className="p-0 h-auto text-zinc-400 hover:text-purple-400 transition-colors"
                  children = {'Careers'} 
                />
              </li>
              <li>
                <Button 
                  variant="link" 
                  size="lg" 
                  className="p-0 h-auto text-zinc-400 hover:text-purple-400 transition-colors"
                  children = {'Privacy Policy'} 
                />
              </li>
              <li>
                <Button 
                  variant="link" 
                  size="lg" 
                  className="p-0 h-auto text-zinc-400 hover:text-purple-400 transition-colors"
                  children = {'Terms of Service'} 
                />
              </li>
            </ul>
          </div>
        </div>
        <div className="container mt-12 border-t border-zinc-800 pt-6">
          <p className="text-center text-sm text-zinc-400">
            © {new Date().getFullYear()} Excalidraw Clone. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}