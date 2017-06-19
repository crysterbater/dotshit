#!/usr/bin/perl

# obmenu-generator - schema file

=for comment

    item:      add an item inside the menu               {item => ["command", "label", "icon"]},
    cat:       add a category inside the menu             {cat => ["name", "label", "icon"]},
    sep:       horizontal line separator                  {sep => undef}, {sep => "label"},
    pipe:      a pipe menu entry                         {pipe => ["command", "label", "icon"]},
    file:      include the content of an XML file        {file => "/path/to/file.xml"},
    raw:       any XML data supported by Openbox          {raw => q(xml data)},
    begin_cat: begin of a category                  {begin_cat => ["name", "icon"]},
    end_cat:   end of a category                      {end_cat => undef},
    obgenmenu: generic menu settings                {obgenmenu => ["label", "icon"]},
    exit:      default "Exit" action                     {exit => ["label", "icon"]},

=cut

# NOTE:
#    * Keys and values are case sensitive. Keep all keys lowercase.
#    * ICON can be a either a direct path to an icon or a valid icon name
#    * Category names are case insensitive. (X-XFCE and x_xfce are equivalent)

require "$ENV{HOME}/.config/obmenu-generator/config.pl";

## Text editor
my $editor = $CONFIG->{editor};

our $SCHEMA = [
	{sep => 'XXX'},

    #          COMMAND                 LABEL              ICON
    {item => ['xfce4-terminal',            'Terminal',     'utilities-terminal']},
		{item => ['rofi -show run',            'Rofi',     'utilities-terminal']},
		{item => ['xdg-open .',       'File Manager', 'system-file-manager']},

    {sep => ' '},

    #          NAME            LABEL                ICON



    {begin_cat => ['Applications', 'Interface']},
    {cat => ['utility',     'Accessories', 'applications-utilities']},
    {cat => ['game',        'Games',       'applications-games']},
    {cat => ['graphics',    'Graphics',    'applications-graphics']},
    {cat => ['audiovideo',  'Multimedia',  'applications-multimedia']},
    {cat => ['network',     'Network',     'applications-internet']},

      {end_cat => undef},
          {cat => ['settings',    'Settings',    'applications-accessories']},
    {cat => ['system',      'System',      'applications-system']},
		{begin_cat => ['Favorites', 'Interface']},
		    {item => ['xdg-open .',       'File Manager', 'system-file-manager']},

        {item => ['vivaldi-snapshot',    'Vivaldi',             'accessories-text-editor']},
        {item => ['lxappearance', 'LXappearance',  'accessories-text-editor']},
        {item => ['atom',       'Atom',            'accessories-text-editor']},
        {item => ['gcolor3',    'Color Picker', 'accessories-text-editor']},
        {item => ['gcolor2',    'gcolor2', 'accessories-text-editor']},
        {item => ['pinta',    'Pinta', 'accessories-text-editor']},
        {item    => ['pamac-manager', 'Add/Remove', 'view-refresh']},
        {item      => ["oomox", 'Oomox', 'text-x-generic']},
        {item      => ["$gksudo lightdm-gtk-greeter-settings", 'LightDM', 'text-x-generic']},
      {end_cat => undef},

    {sep => ' '},


    #          NAME            LABEL                ICON
    {cat => ['Interface',     'Interface', 'applications-utilities']},

    #                  LABEL          ICON
    #{begin_cat => ['My category',  'cat-icon']},
    #             ... some items ...
    #{end_cat   => undef},

    #            COMMAND     LABEL        ICON
    #{pipe => ['obbrowser', 'Disk', 'drive-harddisk']},

    ## Generic advanced settings
    #{sep       => undef},
    #{obgenmenu => ['Openbox Settings', 'applications-engineering']},
    #{sep       => undef},
    #{sep       => undef},
    #{obgenmenu => ['UI Settings', 'applications-engineering']},
    #{sep       => undef},


	#{begin_cat => ['UI',  'cat-icon']},
    #{item => ['al-obthemes',    'ALOB Themes Manager',             'accessories-text-editor']},
    #{end_cat   => undef},


	# Openbox category
      {begin_cat => ['UI', 'Interface']},
        {item => ['al-obthemes',    'ALOB Themes Manager',             'accessories-text-editor']},
        {item => ['lxappearance', 'LXappearance',  'accessories-text-editor']},
        {item => ['xfce4-appearance-settings',       'GTK Appearance',            'accessories-text-editor']},
        {item => ['gcolor3',    'Color Picker', 'accessories-text-editor']},
        {item      => ["oomox-gui", 'Oomox', 'text-x-generic']},
        {item      => ["nitrogen", 'wallpaper', 'text-x-generic']},
        {item      => ["sudo lightdm-gtk-greeter-settings", 'LightDM', 'text-x-generic']},
				{item => ["$editor ~/.conkyrc",              'Conky RC',    'text-x-generic']},
				{pipe => ['al-compositor',      'Compositor',      'compton']},

				{item    => ['tint2conf', 'tint2', 'view-refresh']},
      {end_cat => undef},

			{pipe => ["obbrowser", "Files", "drive-harddisk"]},
			{sep  => undef},

			{begin_cat => ['obmenu', 'accessories-text-editor']},
        {item      => ["$editor ~/.config/obmenu-generator/schema.pl", 'Menu Schema', 'text-x-generic']},
        {item      => ["$editor ~/.config/obmenu-generator/config.pl", 'Menu Config', 'text-x-generic']},
				{item => ['obmenu',                                 'GUI Menu Editor',                    'theme']},
            {item => ['obconf',                                 'GUI Config Tool',               'theme']},
            {item => ['obkey',                                  'GUI Keybinds',                  'theme']},

        {sep  => undef},
        {item => ['obmenu-generator -s -c',    'Generate a static menu',             'accessories-text-editor']},
        {item => ['obmenu-generator -s -i -c', 'Generate a static menu with icons',  'accessories-text-editor']},
        {sep  => undef},
        {item => ['obmenu-generator -p',       'Generate a dynamic menu',            'accessories-text-editor']},
        {item => ['obmenu-generator -p -i',    'Generate a dynamic menu with icons', 'accessories-text-editor']},
        {sep  => undef},

        {item    => ['obmenu-generator -d', 'Refresh Icon Set', 'view-refresh']},
      {end_cat => undef},
			{begin_cat => ['Openbox', 'openbox']},
				{item      => ["$editor ~/.config/openbox/autostart", 'Openbox Autostart',   'text-x-generic']},
				{item      => ["$editor ~/.config/openbox/rc.xml",    'Openbox RC',          'text-x-generic']},
				{item      => ["$editor ~/.config/openbox/menu.xml",  'Openbox Menu',        'text-x-generic']},
				{item      => ['openbox --reconfigure',               'Reconfigure Openbox', 'openbox']},
				{pipe => ['al-help-pipemenu',              'Help &amp; Resources',              'info']},
{pipe => ['al-kb-pipemenu',                'Display Keybinds',                  'cs-keyboard']},
			{end_cat => undef},

    {sep       => undef},
    {begin_cat => ['Advanced ', 'applications-engineering']},
    #          COMMAND                 LABEL              ICON

    {sep => ' '},

      # Openbox category





      # Configuration files
      {item => ["$editor ~/.config/tint2/tint2rc", 'Tint2 Panel', 'text-x-generic']},

      # obmenu-generator category
      {begin_cat => ['Obmenu-Generator', 'accessories-text-editor']},
        {item      => ["$editor ~/.config/obmenu-generator/schema.pl", 'Menu Schema', 'text-x-generic']},
        {item      => ["$editor ~/.config/obmenu-generator/config.pl", 'Menu Config', 'text-x-generic']},
				{item => ['obmenu',                                 'GUI Menu Editor',                    'theme']},
            {item => ['obconf',                                 'GUI Config Tool',               'theme']},
            {item => ['obkey',                                  'GUI Keybinds',                  'theme']},

        {sep  => undef},
        {item => ['obmenu-generator -s -c',    'Generate a static menu',             'accessories-text-editor']},
        {item => ['obmenu-generator -s -i -c', 'Generate a static menu with icons',  'accessories-text-editor']},
        {sep  => undef},
        {item => ['obmenu-generator -p',       'Generate a dynamic menu',            'accessories-text-editor']},
        {item => ['obmenu-generator -p -i',    'Generate a dynamic menu with icons', 'accessories-text-editor']},
        {sep  => undef},

        {item    => ['obmenu-generator -d', 'Refresh Icon Set', 'view-refresh']},
      {end_cat => undef},

	  # UI-Category





      # Openbox category

     {end_cat => undef},



    {sep => undef},

    ## The xscreensaver lock command





    ## This uses the 'oblogout' menu

    ## This option uses the default Openbox's action "Exit"
        {item => ['rofi-theme-selector',            'rofi+dmenu',     'utilities-terminal']},
				{item => ['gmrun',            'Run',  'system-run']},

    {exit => ['Exit', 'application-exit']},
]
