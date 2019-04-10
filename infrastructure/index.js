const cdk = require('@aws-cdk/cdk');
const ecs = require('@aws-cdk/aws-ecs');
const ec2 = require('@aws-cdk/aws-ec2');
const elbv2 = require('@aws-cdk/aws-elasticloadbalancingv2');
const { DockerImageAsset } = require('@aws-cdk/assets-docker');
const path = require('path');

class BlogStack extends cdk.Stack {
  constructor(parent, id, props) {
    super(parent, id, props);
    const vpc = ec2.VpcNetwork.import(this, 'defaultVPC', {
      vpcId: 'vpc-907369f4',
      availabilityZones: ['us-east-1a', 'us-east-1b'],
      publicSubnetIds: ['subnet-0d198455', 'subnet-12107277']
    });

    const cluster = new ecs.Cluster(this, 'BlogCluster', { vpc });

    cluster.addCapacity('DefaultAutoScalingGroup', {
      instanceType: new ec2.InstanceType('t3.micro'),
      vpcSubnets: {
        subnetType: ec2.SubnetType.Public
      }
    });

    const proxyImage = new DockerImageAsset(this, 'Proxy', {
      directory: path.join(__dirname, '../hypernova-proxy-go')
    });

    const blogImage = new DockerImageAsset(this, 'Blog', {
      directory: path.join(__dirname, '../blog')
    });

    const hypernovaImage = new DockerImageAsset(this, 'Hypernova', {
      directory: path.join(__dirname, '../hypernova')
    });

    const blogTaskDefinition = new ecs.Ec2TaskDefinition(this, 'blog-task-definition')

    const hypernovaContainer = blogTaskDefinition.addContainer('hypernova', {
      image: ecs.ContainerImage.fromEcrRepository(hypernovaImage.repository),
      memoryLimitMiB: 128,
      cpu: 128,
      essential: true
    });

    hypernovaContainer.addPortMappings({
      containerPort: 3000
    });

    const blogContainer = blogTaskDefinition.addContainer('blog', {
      image: ecs.ContainerImage.fromEcrRepository(blogImage.repository),
      memoryLimitMiB: 128,
      cpu: 128,
      essential: true,
    });

    blogContainer.addPortMappings({
      containerPort: 8000
    });

    blogContainer.addLink(hypernovaContainer);

    const proxyContainer = blogTaskDefinition.addContainer('proxy', {
      image: ecs.ContainerImage.fromEcrRepository(proxyImage.repository),
      memoryLimitMiB: 128,
      cpu: 128,
      essential: true
    });

    proxyContainer.addPortMappings({
      containerPort: 8080
    });

    proxyContainer.addLink(hypernovaContainer);
    proxyContainer.addLink(blogContainer);

    const blogService = new ecs.Ec2Service(this, 'blog-service', {
      cluster,
      desiredCount: 2,
      taskDefinition: blogTaskDefinition
    });

    const loadBalancer = new elbv2.ApplicationLoadBalancer(this, 'external', {
      vpc,
      internetFacing: true
    });

    const listener = loadBalancer.addListener('PublicListener', {
      port: 80
    });

    const applicationTargetGroup = new elbv2.ApplicationTargetGroup(this, 'default', {
      vpc,
      port: 80
    });

    listener.addTargetGroups('default', {
      targetGroups: [applicationTargetGroup]
    });

    blogTaskDefinition.defaultContainer = proxyContainer;

    blogService.attachToApplicationTargetGroup(applicationTargetGroup)
  }
}
  
class BlogApp extends cdk.App {
  constructor(argv) {
    super(argv);
    new BlogStack(this, 'blog-stack');
  }
}

new BlogApp().run();