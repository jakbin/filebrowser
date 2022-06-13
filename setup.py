# -*- coding: utf-8 -*-
"""
filebrowser
========

Simple web file browser in python-flask.

More details on project's README and
`github page <https://github.com/jakbin/filebrowser>`_.


Development Version
-------------------

The filebrowser development version can be installed by cloning the git
repository from `github`_::

    git clone git@github.com:jakbin/filebrowser.git

.. _github: https://github.com/jakbin/filebrowser

License
-------
MIT (see LICENSE file).
"""

from filebrowser.main import __version__

try:
    from setuptools import setup
except ImportError:
    from distutils.core import setup

with open("README.md", "r", encoding="utf-8") as readme_file:
    readme = readme_file.read()

setup(
    name="filebrowser",
    version=__version__,
    url="https://github.com/jakbin/filebrowser",
    license="MIT License",
    author="jakbin",
    description="Simple web file browser",
    long_description=readme,
    long_description_content_type="text/markdown",
    classifiers=[
        'Development Status :: 4 - Beta',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Programming Language :: Python :: 3',
        ],
    keywords=['filebrowser', 'web', 'file', 'browser', 'web browser'],
    packages=[
        'filebrowser',
        ],
    entry_points={
        'console_scripts': (
            'filebrowser=filebrowser.main:main'
            )
        },
    package_data={
        'filebrowser': [
            'templates/*',
            'static/fonts/*',
            'static/js/*',
            'static/css/*',
        ]},
    install_requires=['flask<=2.0'],
    zip_safe=False,
    platforms='any'
)
