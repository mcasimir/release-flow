import Sequence from './Sequence';

export default function Step(name) {
  return (target, methodName, descriptor) => {
    let stepName = name || methodName;
    target.steps = target.steps || new Sequence();

    target.steps.push({
      name: stepName,
      run: target[methodName].bind(target)
    });

    return descriptor;
  };
}
