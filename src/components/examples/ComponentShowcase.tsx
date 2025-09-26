"use client";

import { useState } from 'react';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Badge,
  Modal,
  ModalBody,
  ModalFooter
} from '../ui';
import { StatusBadge } from '../business';
import type { StatusType } from '../business/StatusBadge';

/**
 * ComponentShowcase - Demonstrates all UI components in action
 * This component serves as both documentation and testing for the modular architecture
 */
export default function ComponentShowcase() {
  const [showModal, setShowModal] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsyncAction = async () => {
    setLoading(true);
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    setShowModal(true);
  };

  const statusTypes: StatusType[] = ['active', 'pending', 'completed', 'disputed', 'cancelled', 'funds_locked'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>🎨 Component Showcase</CardTitle>
          <p className="text-gray-600">
            Explore all available UI components in the GhostPalace design system
          </p>
        </CardHeader>
      </Card>

      {/* Buttons Section */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Button Variants */}
            <div>
              <h4 className="font-medium mb-3">Variants</h4>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="success">Success</Button>
              </div>
            </div>

            {/* Button Sizes */}
            <div>
              <h4 className="font-medium mb-3">Sizes</h4>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </div>
            </div>

            {/* Button States */}
            <div>
              <h4 className="font-medium mb-3">States</h4>
              <div className="flex flex-wrap gap-3">
                <Button loading={loading} onClick={handleAsyncAction}>
                  {loading ? 'Loading...' : 'Async Action'}
                </Button>
                <Button disabled>Disabled</Button>
                <Button icon="🚀" iconPosition="left">With Icon</Button>
                <Button icon="➡️" iconPosition="right">Icon Right</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inputs Section */}
      <Card>
        <CardHeader>
          <CardTitle>Form Inputs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-w-md">
            <Input
              label="Basic Input"
              placeholder="Enter some text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            
            <Input
              label="With Left Icon"
              placeholder="Search..."
              leftIcon="🔍"
            />
            
            <Input
              label="With Right Icon"
              placeholder="Enter amount"
              rightIcon="₹"
              type="number"
            />
            
            <Input
              label="Error State"
              placeholder="This field has an error"
              error="This field is required"
              value=""
            />
            
            <Input
              label="With Helper Text"
              placeholder="Your email"
              helperText="We'll never share your email with anyone"
              type="email"
            />
            
            <Input
              label="Filled Variant"
              placeholder="Filled background"
              variant="filled"
            />
          </div>
        </CardContent>
      </Card>

      {/* Badges Section */}
      <Card>
        <CardHeader>
          <CardTitle>Badges & Status Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Regular Badges */}
            <div>
              <h4 className="font-medium mb-3">Badge Variants</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
                <Badge variant="info">Info</Badge>
              </div>
            </div>

            {/* Badge Sizes */}
            <div>
              <h4 className="font-medium mb-3">Badge Sizes</h4>
              <div className="flex flex-wrap items-center gap-2">
                <Badge size="sm">Small</Badge>
                <Badge size="md">Medium</Badge>
                <Badge size="lg">Large</Badge>
              </div>
            </div>

            {/* Status Badges */}
            <div>
              <h4 className="font-medium mb-3">Marketplace Status Badges</h4>
              <div className="flex flex-wrap gap-2">
                {statusTypes.map((status) => (
                  <StatusBadge key={status} status={status} />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="default" hover>
          <CardHeader>
            <CardTitle>Default Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              This is a default card with hover effect enabled.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm">Action</Button>
          </CardFooter>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Elevated Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              This card has enhanced shadow for emphasis.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="primary" size="sm">Primary Action</Button>
          </CardFooter>
        </Card>

        <Card variant="outlined">
          <CardHeader>
            <CardTitle>Outlined Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              This card has a prominent border styling.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" size="sm">Secondary</Button>
          </CardFooter>
        </Card>
      </div>

      {/* Interactive Demo */}
      <Card>
        <CardHeader>
          <CardTitle>🎮 Interactive Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              Test the interactive components:
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setShowModal(true)}>
                Open Modal
              </Button>
              <Button 
                variant="success" 
                onClick={() => alert('Success action triggered!')}
              >
                Success Action
              </Button>
              <Button 
                variant="danger" 
                onClick={() => confirm('Are you sure?')}
              >
                Confirm Action
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal Example */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="🎉 Modal Example"
        description="This demonstrates the modal component in action"
        size="md"
      >
        <ModalBody>
          <div className="space-y-4">
            <p>
              This is a fully functional modal with customizable size, title, and content.
              It supports keyboard navigation and click-outside-to-close functionality.
            </p>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Modal Features:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✅ Responsive design</li>
                <li>✅ Keyboard accessibility</li>
                <li>✅ Focus management</li>
                <li>✅ Customizable sizes</li>
                <li>✅ Backdrop click handling</li>
              </ul>
            </div>

            <Input
              label="Try typing in this input"
              placeholder="Modal inputs work perfectly"
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setShowModal(false)}>
            Confirm
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
