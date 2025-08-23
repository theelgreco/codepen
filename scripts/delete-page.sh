#!/bin/bash

if [ $# -eq 0 ]; then
    echo ""
    echo "No page supplied"
    echo ""
else
    echo ""
    echo "Deleting $1..."
    echo ""
    echo "Removing src/client/pages/$1 and all subdirectories..."
    echo ""

    rm -rf ./src/client/pages/$1

    echo "$1 deleted successfully!"
    echo ""
    echo ""
fi