#-- START ZCACHE GENERATED FILE
#-- GENERATED: Sun Jun 18 19:45:58 PDT 2017
#-- ANTIGEN v2.2.0
_antigen () {
	local -a _1st_arguments
	_1st_arguments=('apply:Load all bundle completions' 'bundle:Install and load the given plugin' 'bundles:Bulk define bundles' 'cleanup:Clean up the clones of repos which are not used by any bundles currently loaded' 'cache-gen:Generate cache' 'init:Load Antigen configuration from file' 'list:List out the currently loaded bundles' 'purge:Remove a cloned bundle from filesystem' 'reset:Clears cache' 'restore:Restore the bundles state as specified in the snapshot' 'revert:Revert the state of all bundles to how they were before the last antigen update' 'selfupdate:Update antigen itself' 'snapshot:Create a snapshot of all the active clones' 'theme:Switch the prompt theme' 'update:Update all bundles' 'use:Load any (supported) zsh pre-packaged framework') 
	_1st_arguments+=('help:Show this message' 'version:Display Antigen version') 
	__bundle () {
		_arguments '--loc[Path to the location <path-to/location>]' '--url[Path to the repository <github-account/repository>]' '--branch[Git branch name]' '--no-local-clone[Do not create a clone]'
	}
	__list () {
		_arguments '--simple[Show only bundle name]' '--short[Show only bundle name and branch]' '--long[Show bundle records]'
	}
	__cleanup () {
		_arguments '--force[Do not ask for confirmation]'
	}
	_arguments '*:: :->command'
	if (( CURRENT == 1 ))
	then
		_describe -t commands "antigen command" _1st_arguments
		return
	fi
	local -a _command_args
	case "$words[1]" in
		(bundle) __bundle ;;
		(use) compadd "$@" "oh-my-zsh" "prezto" ;;
		(cleanup) __cleanup ;;
		(update|purge) compadd $(type -f \-antigen-get-bundles &> /dev/null || antigen &> /dev/null; -antigen-get-bundles --simple 2> /dev/null) ;;
		(theme) compadd $(type -f \-antigen-get-themes &> /dev/null || antigen &> /dev/null; -antigen-get-themes 2> /dev/null) ;;
		(list) __list ;;
	esac
}
antigen () {
  local MATCH MBEGIN MEND
  [[ "$ZSH_EVAL_CONTEXT" =~ "toplevel:*" || "$ZSH_EVAL_CONTEXT" =~ "cmdarg:*" ]] && source "/antigen/antigen.zsh" && eval antigen $@;
  return 0;
}
typeset -gaU fpath path
fpath+=() path+=()
_antigen_compinit () {
  autoload -Uz compinit; compinit -d "/home/pringled/.antigen/.zcompdump"; compdef _antigen antigen
  add-zsh-hook -D precmd _antigen_compinit
}
autoload -Uz add-zsh-hook; add-zsh-hook precmd _antigen_compinit
compdef () {}

if [[ -n "/home/pringled/.oh-my-zsh" ]]; then
  ZSH="/home/pringled/.oh-my-zsh"; ZSH_CACHE_DIR="/home/pringled/.antigen/bundles/robbyrussell/oh-my-zsh/cache/"
fi
#--- BUNDLES BEGIN

#--- BUNDLES END
typeset -gaU _ANTIGEN_BUNDLE_RECORD; _ANTIGEN_BUNDLE_RECORD=('https://github.com/robbyrussell/oh-my-zsh.git lib plugin true' 'https://github.com/robbyrussell/oh-my-zsh.git plugins/git plugin true' 'https://github.com/robbyrussell/oh-my-zsh.git plugins/heroku plugin true' 'https://github.com/robbyrussell/oh-my-zsh.git plugins/pip plugin true' 'https://github.com/robbyrussell/oh-my-zsh.git plugins/lein plugin true' 'https://github.com/robbyrussell/oh-my-zsh.git plugins/command-not-found plugin true' 'https://github.com/zsh-users/zsh-syntax-highlighting.git / plugin true' 'https://github.com/robbyrussell/oh-my-zsh.git themes/robbyrussell.zsh-theme theme true')
typeset -g _ANTIGEN_CACHE_LOADED=true ANTIGEN_CACHE_VERSION='v2.2.0'

#-- END ZCACHE GENERATED FILE
