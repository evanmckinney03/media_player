
from PyInstaller.utils.hooks import collect_submodules

module_collection_mode = 'py'
hiddenimports = collect_submodules('scripts')
