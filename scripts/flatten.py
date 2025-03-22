import os

# Lista de directorios que NO quieres recorrer
IGNORE_DIRS = [
    'node_modules',
    '.git',
    'dist',
    'build',
    '.next',
    '.cache',
    '.vercel',
    'coverage',
    'public',           # (2) Ignorar carpeta /public
]

# Lista de archivos que NO quieres incluir
IGNORE_FILES = [
    '.DS_Store',
    'yarn.lock',
    'package-lock.json',
    'pnpm-lock.yaml',
    'aplanado.txt',         # Evitar el archivo "aplanado" en sí
    'flatten.py',           # (3) Evitar incluir este propio script
    # (1) Archivos de config:
    'tailwind.config.ts',
    'postcss.config.js',
    'eslint.config.js',
    'tsconfig.json',
    'tsconfig.app.json',
    'tsconfig.node.json',
    'vite.config.ts',
    'index.html',           # Si prefieres omitir tu HTML base
]

# Lista de extensiones que SÍ quieres incluir
# (quita extensiones de config si no deseas incluirlas)
ALLOWED_EXTENSIONS = [
    '.js', '.jsx', '.ts', '.tsx',
    '.json', '.md',
    '.py', '.env', '.lock', '.txt'
]

def flatten_project_to_text(root_path, output_file):
    """
    Recorre de forma recursiva 'root_path' y escribe en 'output_file'
    el contenido de cada archivo que pase los filtros de IGNORE_DIRS,
    IGNORE_FILES y ALLOWED_EXTENSIONS.
    """
    with open(output_file, 'w', encoding='utf-8') as out:
        # Recorrer todo el árbol de directorios
        for dirpath, dirnames, filenames in os.walk(root_path):
            # Quitar de la lista los directorios ignorados
            dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS]

            for file in filenames:
                # Ignorar archivos específicos
                if file in IGNORE_FILES:
                    continue

                # Comprobar extensión si quieres filtrar por ALLOWED_EXTENSIONS
                _, ext = os.path.splitext(file)
                if ALLOWED_EXTENSIONS and ext not in ALLOWED_EXTENSIONS:
                    continue

                filepath = os.path.join(dirpath, file)

                # Leer el contenido del archivo
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                except Exception as e:
                    print(f"No se pudo leer el archivo {filepath}. Error: {e}")
                    continue

                # Escribir en el archivo de salida
                relative_path = os.path.relpath(filepath, root_path)
                out.write(f"--- FILE: {relative_path} ---\n")
                out.write(content)
                out.write("\n\n")


if __name__ == "__main__":
    import sys

    # Si no se pasan argumentos, usar valores por defecto
    if len(sys.argv) < 3:
        root_path = "."
        output_file = "aplanado.txt"
        print("No se especificaron argumentos. Se usarán valores por defecto:")
        print(f"  Directorio a aplanar: {root_path}")
        print(f"  Archivo de salida: {output_file}")
    else:
        root_path = sys.argv[1]
        output_file = sys.argv[2]

    flatten_project_to_text(root_path, output_file)
    print(f"Se ha creado el archivo de texto: {output_file}")
