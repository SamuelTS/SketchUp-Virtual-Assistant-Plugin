# Virtual Assistant extension for SketchUp 2017 or newer.
# Copyright: © 2019 Samuel Tallet <samuel.tallet arobase gmail.com>
# 
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3.0 of the License, or
# (at your option) any later version.
# 
# If you release a modified version of this program TO THE PUBLIC,
# the GPL requires you to MAKE THE MODIFIED SOURCE CODE AVAILABLE
# to the program's users, UNDER THE GPL.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
# General Public License for more details.
# 
# Get a copy of the GPL here: https://www.gnu.org/licenses/gpl.html

raise 'The VAT plugin requires at least Ruby 2.2.0 or SketchUp 2017.'\
  unless RUBY_VERSION.to_f >= 2.2 # SketchUp 2017 includes Ruby 2.2.4.

require 'sketchup'
require 'extensions'

# VAT plugin namespace.
module VAT

  VERSION = '1.0.2'.freeze

  # Load translation if it's available for current locale.
  TRANSLATE = LanguageHandler.new('vat.strings')
  # See: "vat/Resources/#{Sketchup.get_locale}/vat.strings"

  # Remember extension name. See: VAT::Menu.
  NAME = TRANSLATE['Virtual Assistant']

  # Register extension.

  extension = SketchupExtension.new(NAME, 'vat/load.rb')

  extension.version     = VERSION
  extension.creator     = 'Samuel Tallet'
  extension.copyright   = "© 2019 #{extension.creator}"

  features = [
    TRANSLATE['Control SketchUp with your voice or text messages.']
  ]

  extension.description = features.join(' ')

  Sketchup.register_extension(
    extension,
    true # load_at_start
  )

end
