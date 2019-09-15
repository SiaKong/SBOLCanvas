#!/usr/bin/env python3

# xml libarary documentation at:
# https://docs.python.org/3/library/xml.etree.elementtree.html

import xml.etree.ElementTree as et
import sys

HEIGHT_MAX 	= 100
WIDTH_MAX 	= 100

MIN_X_PADDING = 15
MIN_Y_PADDING = 8

STROKE_WIDTH = 6

CENTERED = False

def main(inputPath, outputPath):
	tree = et.parse(inputPath)

	root = tree.getroot()
	try:
		if root.attrib['name']:
	 		del root.attrib['name']
	except:
		pass


	for shape in root.iter('shape'):
		name = shape.attrib['name']
		print(name)
		set_stroke_width(shape, STROKE_WIDTH)
		fixShape(shape)

	#tree.write(outputPath + '/' + name + '.xml')
	tree.write(outputPath)


def fixShape(shape):

	''' Scales the shape and ajusts its placement on the SVG 'page' '''
	shape.set('h', str(HEIGHT_MAX))
	shape.set('w', str(WIDTH_MAX))

	#
	# First we decide the scaling factor and rescale.
	#
	data = get_data(shape)
	print(data)

	# What is the scaling factor we need to fit in the x direction?
	# The total distance from min_x to max_x needs to be < WIDTH_MAX - MIN_X_PADDING * 2 // *2 because the x padding is on both sides.
	x_distance = data['max_x'] - data['min_x']
	x_scale = (WIDTH_MAX - MIN_X_PADDING * 2) / x_distance
	print("min x scale need = {scale}".format(scale=x_scale))

	# What is the scaling factor we need to fit in the y direction?
	# The total distance from min_y to max_y needs to be < HEIGHT_MAX - MIN_Y_PADDING
	y_distance = data['max_y'] - data['min_y']
	y_scale = (HEIGHT_MAX - MIN_Y_PADDING) / y_distance
	print("min y scale need = {scale}".format(scale=y_scale))

	# We take the minimum of these two scales to ensure that the whole thing fits on the SVG 'page'
	scale = min(x_scale, y_scale)
	scale_shape(shape, scale)

	#
	# Now that the shape is a managable size, we need to place it on the SVG 'page' perfectly
	# Get the data again because our coords have changed.
	#
	data = get_data(shape)
	print(data)

	# We take the width and center it 
	glyph_width = data['max_x'] - data['min_x']
	desired_dist = (WIDTH_MAX - glyph_width) / 2
	x_adjustment_dist = (data['min_x'] - desired_dist) * -1 if data['min_x'] - desired_dist >= 0 else desired_dist - data['min_x']
	print("x_adjustment_dist = {x}".format(x=x_adjustment_dist))
	shift_x_direction(shape, x_adjustment_dist)

	# Y direction might be a bit trickier depending on if the glyph is centered horizontally.
	glyph_height = data['max_y'] - data['min_y']
	desired_dist = HEIGHT_MAX - glyph_height

	if is_centered(shape):
		desired_dist = (HEIGHT_MAX - glyph_height) / 2

	y_adjustment_dist = (data['min_y'] - desired_dist) * -1 if data['min_y'] >= 0 else desired_dist - data['min_y']
		
	print("y_adjustment_dist = {y}".format(y=y_adjustment_dist))
	shift_y_direction(shape, y_adjustment_dist)


############################## Helper functions ########################################

def shift_x_direction(shape, distance):
	for path in shape.findall('./foreground/path'):
		for child in path.getchildren():
			for key, val in child.attrib.items():
				val = float(val)
				if 'x' in key or 'X' in key:
					val += distance
				child.attrib[key] = str(val)

def shift_y_direction(shape, distance):
	for path in shape.findall('./foreground/path'):
		for child in path.getchildren():
			for key, val in child.attrib.items():
				val = float(val)
				if 'y' in key or 'Y' in key:
					val += distance
				child.attrib[key] = str(val)

def scale_shape(shape, factor):
	for path in shape.findall('./foreground/path'):
		for child in path.getchildren():
			for key, val in child.attrib.items():
				val = float(val)
				if 'x' in key or 'X' in key:
					val *= factor
				elif 'y' in key or 'Y' in key:
					val *= factor
				child.attrib[key] = str(val)

def set_stroke_width(shape, width):
	setting = shape.find('./foreground/strokewidth')
	for key, val in setting.attrib.items():
		if 'width' in key:
			val = width
		setting.attrib[key] = str(val)

def is_centered(shape):
	setting_found = False
	for key, val in shape.attrib.items():
		if 'centered' in key:
			setting_found = True
			if 'true' in val:
				return True
	if not setting_found:
		print("'centered' attribute not found in shape, assuming it is not centered.")
	
	return False

def get_data(shape):
	data = {
		'min_y' : 0,
		'max_y' : 0,
		'min_x' : 0,
		'max_x' : 0,
		}
	

	is_first_path_x = True
	is_first_path_y = True

	for path in shape.findall('./foreground/path'):
		for child in path.getchildren():
			for key, val in child.attrib.items():
				val = float(val)

				if 'x' in key or 'X' in key:
					# Look for minimum x
					if is_first_path_x:
						data['min_x'] = val
						is_first_path_x = False
					elif data['min_x'] > val:
						data['min_x'] = val
					# Look for maximum x
					if data['max_x'] < val:
						data['max_x'] = val

				elif 'y' in key or 'Y' in key:
					# Look for minimum y
					if is_first_path_y:
						data['min_y'] = val
						is_first_path_y = False
					elif data['min_y'] > val:
						data['min_y'] = val
					# Look for maximum y
					if data['max_y'] < val:
						data['max_y'] = val

			
	is_first_path_x = True
	is_first_path_y = True

	assert (data['min_y'] < data['max_y']), "y-coords messed up!"
	assert (data['min_x'] < data['max_x']), "x-coords messed up!"

	return data



if __name__ == '__main__':
	if len(sys.argv) != 3:
		print('Usage: python3 xmlFixer.py <path/to/input.xml> <path/to/output/folder>')
		exit()
	main(sys.argv[1], sys.argv[2])